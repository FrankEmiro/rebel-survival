package it.cyberrebellion.rebelsurvival;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

import com.bitchat.android.rs.RsMesh;

/**
 * Rebel Survival per Android: la stessa app web, presa dai file dentro l'APK
 * (assets/www) e mostrata in una WebView. Funziona senza internet.
 *
 * Indirizzo interno: https://appassets.androidplatform.net/ (dominio riservato
 * da Android a questo uso: non va mai su internet). Essendo https, la pagina ha
 * localStorage, GPS e fotocamera come nel browser.
 *
 * Ponte verso JavaScript: window.RSAndroid (vedi classe Bridge).
 */
public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    static final String START = "https://" + HOST + "/index.html";
    static final String APK_NAME = "RebelSurvival.apk";   // nome del file condiviso (rinomina prodotto: cambiare qui)

    private static final int REQ_LOCATION = 1, REQ_CAMERA = 2, REQ_FILE = 3, REQ_BT = 4, REQ_NOTIFY = 5, REQ_MIC = 6;

    private WebView web;
    private GeolocationPermissions.Callback geoCb;
    private String geoOrigin;
    private PermissionRequest camReq;
    private ValueCallback<Uri[]> fileCb;

    private static final Map<String, String> MIME = new HashMap<>();
    static {
        MIME.put("html", "text/html"); MIME.put("js", "text/javascript"); MIME.put("css", "text/css");
        MIME.put("json", "application/json"); MIME.put("geojson", "application/json");
        MIME.put("png", "image/png"); MIME.put("jpg", "image/jpeg"); MIME.put("svg", "image/svg+xml");
        MIME.put("webp", "image/webp"); MIME.put("ico", "image/x-icon");
        MIME.put("woff", "font/woff"); MIME.put("woff2", "font/woff2"); MIME.put("ttf", "font/ttf");
        MIME.put("pdf", "application/pdf"); MIME.put("wasm", "application/wasm");
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xFF131810);
        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        // Android 15+ disegna sotto le barre di sistema: lascio lo spazio giusto
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                v.setPadding(i.left, i.top, i.right, i.bottom);
            } else {
                v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                        insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setGeolocationEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setUserAgentString(s.getUserAgentString() + " RebelSurvivalApp");

        // Con l'app in secondo piano la pagina continua a lavorare (download di Wikipedia):
        // il processo della WebView non viene declassato quando non è visibile
        web.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);

        web.addJavascriptInterface(new Bridge(), "RSAndroid");
        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome());

        // Chat Bluetooth: gli eventi (messaggi, vicini) arrivano alla pagina come RSMeshEvent({...})
        RsMesh.attach(this);
        RsMesh.INSTANCE.setListener(json -> runOnUiThread(() ->
                web.evaluateJavascript("window.RSMeshEvent && window.RSMeshEvent(" + json + ")", null)));

        if (state != null) web.restoreState(state);
        else web.loadUrl(START + launchQuery(getIntent()));
    }

    // Scorciatoia «Emergenza» come nella versione web (/?mode=emergenza)
    private String launchQuery(Intent i) {
        Uri d = i != null ? i.getData() : null;
        String mode = d != null ? d.getQueryParameter("mode") : null;
        return "emergenza".equals(mode) ? "?mode=emergenza" : "";
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) { web.goBack(); return; }
        // l'app è a pagina unica: prima prova a tornare indietro dentro l'app
        web.evaluateJavascript("(window.RSAppBack && window.RSAppBack()) ? 1 : 0", r -> {
            if (!"1".equals(r)) MainActivity.super.onBackPressed();
        });
    }

    /* ── File dell'app presi dall'APK ── */
    private class Client extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (!HOST.equals(u.getHost())) return null;          // internet: lo gestisce la WebView
            String path = u.getPath();
            if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
            String ext = path.substring(path.lastIndexOf('.') + 1).toLowerCase();
            String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
            Map<String, String> h = new HashMap<>();
            h.put("Cache-Control", "no-cache");
            try {
                InputStream in = getAssets().open("www" + Uri.decode(path));
                String enc = mime.startsWith("text/") || mime.endsWith("json") || mime.endsWith("javascript") ? "utf-8" : null;
                return new WebResourceResponse(mime, enc, 200, "OK", h, in);
            } catch (IOException e) {
                return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", h, null);
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (HOST.equals(u.getHost())) {
                String p = String.valueOf(u.getPath());
                if (p.toLowerCase().endsWith(".pdf")) { openPdf(p); return true; }
                return false;                                    // pagina interna (es. privacy)
            }
            // telefono (tel:112), siti esterni, mail: alle app del telefono
            try {
                Intent i = new Intent(Intent.ACTION_VIEW, u);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (ActivityNotFoundException e) {
                toast("Nessuna app per aprire questo collegamento.");
            }
            return true;
        }
    }

    /* ── Permessi GPS, fotocamera (torcia), scelta file (ripristino backup) ── */
    private class Chrome extends WebChromeClient {
        @Override
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) {
            if (has(Manifest.permission.ACCESS_FINE_LOCATION) || has(Manifest.permission.ACCESS_COARSE_LOCATION)) {
                cb.invoke(origin, true, false);
                return;
            }
            geoOrigin = origin; geoCb = cb;
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOCATION);
        }

        @Override
        public void onPermissionRequest(PermissionRequest r) {
            boolean video = false;
            for (String res : r.getResources()) if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(res)) video = true;
            if (!video || !HOST.equals(r.getOrigin().getHost())) { r.deny(); return; }
            if (has(Manifest.permission.CAMERA)) { r.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE}); return; }
            camReq = r;
            requestPermissions(new String[]{Manifest.permission.CAMERA}, REQ_CAMERA);
        }

        @Override
        public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
            if (fileCb != null) fileCb.onReceiveValue(null);
            fileCb = cb;
            try {
                startActivityForResult(p.createIntent(), REQ_FILE);
            } catch (ActivityNotFoundException e) {
                fileCb = null; cb.onReceiveValue(null);
                toast("Nessuna app per scegliere i file.");
            }
            return true;
        }
    }

    private boolean has(String perm) { return checkSelfPermission(perm) == PackageManager.PERMISSION_GRANTED; }

    /* ── Chat Bluetooth (bitchat) ── */
    private String[] btPerms() {
        return Build.VERSION.SDK_INT >= 31
                ? new String[]{Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_ADVERTISE, Manifest.permission.BLUETOOTH_CONNECT}
                : new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION};
    }
    private boolean hasBt() {
        for (String p : btPerms()) if (!has(p)) return Build.VERSION.SDK_INT < 31 && has(Manifest.permission.ACCESS_COARSE_LOCATION);
        return true;
    }
    private void meshEvent(String json) {
        runOnUiThread(() -> web.evaluateJavascript("window.RSMeshEvent && window.RSMeshEvent(" + json + ")", null));
    }
    private void startMesh() {
        android.bluetooth.BluetoothManager bm = (android.bluetooth.BluetoothManager) getSystemService(BLUETOOTH_SERVICE);
        android.bluetooth.BluetoothAdapter ad = bm != null ? bm.getAdapter() : null;
        if (ad == null) { meshEvent("{\"type\":\"error\",\"code\":\"no-bluetooth\"}"); return; }
        if (!ad.isEnabled()) { meshEvent("{\"type\":\"error\",\"code\":\"bluetooth-off\"}"); return; }
        try { RsMesh.start(this); }
        catch (Exception e) { meshEvent("{\"type\":\"error\",\"code\":\"start\"}"); }
    }

    // ── Messaggio vocale per la chat: registra in un file AAC piccolo (voce, 16 kHz mono, ~24 kbit/s) ──
    private android.media.MediaRecorder rec;
    private File recFile;
    private long recStart;
    private static final int VOICE_MAX_MS = 30000;

    private void voiceBegin() {
        try {
            voiceCancel();
            recFile = new File(getCacheDir(), "voce.m4a");
            rec = new android.media.MediaRecorder();
            rec.setAudioSource(android.media.MediaRecorder.AudioSource.MIC);
            rec.setOutputFormat(android.media.MediaRecorder.OutputFormat.MPEG_4);
            rec.setAudioEncoder(android.media.MediaRecorder.AudioEncoder.AAC);
            rec.setAudioChannels(1);
            rec.setAudioSamplingRate(16000);
            rec.setAudioEncodingBitRate(24000);
            rec.setMaxDuration(VOICE_MAX_MS);
            rec.setOutputFile(recFile.getAbsolutePath());
            rec.setOnInfoListener((mr, what, extra) -> {
                if (what == android.media.MediaRecorder.MEDIA_RECORDER_INFO_MAX_DURATION_REACHED) voiceFinish();
            });
            rec.prepare();
            rec.start();
            recStart = System.currentTimeMillis();
            meshEvent("{\"type\":\"voice\",\"state\":\"recording\",\"max\":" + VOICE_MAX_MS + "}");
        } catch (Exception e) {
            voiceCancel();
            meshEvent("{\"type\":\"voice\",\"state\":\"error\"}");
        }
    }

    private void voiceCancel() {
        if (rec != null) {
            try { rec.stop(); } catch (Exception ignored) { }
            try { rec.release(); } catch (Exception ignored) { }
            rec = null;
        }
        if (recFile != null) { try { recFile.delete(); } catch (Exception ignored) { } recFile = null; }
    }

    /** Ferma la registrazione e passa la voce alla pagina (base64), che poi decide se inviarla. */
    private void voiceFinish() {
        if (rec == null || recFile == null) return;
        long ms = System.currentTimeMillis() - recStart;
        File f = recFile;
        try { rec.stop(); } catch (Exception e) { rec.release(); rec = null; recFile = null; f.delete();
            meshEvent("{\"type\":\"voice\",\"state\":\"error\"}"); return; }
        rec.release(); rec = null; recFile = null;
        try {
            byte[] b = new byte[(int) f.length()];
            try (FileInputStream in = new FileInputStream(f)) { int o = 0; while (o < b.length) { int n = in.read(b, o, b.length - o); if (n < 0) break; o += n; } }
            String data = android.util.Base64.encodeToString(b, android.util.Base64.NO_WRAP);
            meshEvent("{\"type\":\"voice\",\"state\":\"done\",\"ms\":" + ms + ",\"mime\":\"audio/mp4\",\"data\":\"" + data + "\"}");
        } catch (Exception e) {
            meshEvent("{\"type\":\"voice\",\"state\":\"error\"}");
        } finally { f.delete(); }
    }

    @Override
    protected void onDestroy() {
        voiceCancel();
        // Senza servizio in background la chat resta attiva solo con l'app aperta
        if (isFinishing()) { RsMesh.stop(); KeepAliveService.stop(this); }
        super.onDestroy();
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        if (code == REQ_NOTIFY) return;   // senza permesso il download continua lo stesso, solo senza notifica visibile
        if (code == REQ_MIC) {
            if (res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED) voiceBegin();
            else meshEvent("{\"type\":\"voice\",\"state\":\"denied\"}");
            return;
        }
        if (code == REQ_BT) {
            if (hasBt()) startMesh(); else meshEvent("{\"type\":\"error\",\"code\":\"permission\"}");
            return;
        }
        boolean ok = res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED;
        if (code == REQ_LOCATION && geoCb != null) { geoCb.invoke(geoOrigin, ok, false); geoCb = null; }
        if (code == REQ_CAMERA && camReq != null) {
            if (ok) camReq.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE}); else camReq.deny();
            camReq = null;
        }
    }

    @Override
    protected void onActivityResult(int code, int result, Intent data) {
        if (code == REQ_FILE && fileCb != null) {
            fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
            fileCb = null;
            return;
        }
        super.onActivityResult(code, result, data);
    }

    /* ── Condivisione ── */
    private void shareFile(File f, String mime, String title) {
        Uri uri = ShareProvider.uriFor(f);
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType(mime);
        send.putExtra(Intent.EXTRA_STREAM, uri);
        send.setClipData(ClipData.newRawUri(f.getName(), uri));
        send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        startActivity(Intent.createChooser(send, title));
    }

    private void openPdf(String assetPath) {
        String name = assetPath.substring(assetPath.lastIndexOf('/') + 1);
        try {
            File out = new File(ShareProvider.dir(this), name);
            try (InputStream in = getAssets().open("www" + Uri.decode(assetPath))) { copy(in, out); }
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(ShareProvider.uriFor(out), "application/pdf");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (ActivityNotFoundException e) {
            toast("Serve un'app per leggere i PDF.");
        } catch (IOException e) {
            toast("Guida PDF non trovata.");
        }
    }

    private static void copy(InputStream in, File out) throws IOException {
        try (OutputStream o = new FileOutputStream(out)) {
            byte[] b = new byte[64 * 1024];
            int n;
            while ((n = in.read(b)) > 0) o.write(b, 0, n);
        }
    }

    private void toast(String t) { runOnUiThread(() -> Toast.makeText(this, t, Toast.LENGTH_LONG).show()); }

    /** Funzioni chiamabili dalla pagina come window.RSAndroid.nome(...) */
    private class Bridge {
        @JavascriptInterface
        public String version() {
            try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionName; }
            catch (Exception e) { return ""; }
        }

        /** Copia l'APK installato e apre la condivisione (Bluetooth, Quick Share…). Ritorna i MB. */
        @JavascriptInterface
        public String shareApp() {
            try {
                File out = new File(ShareProvider.dir(MainActivity.this), APK_NAME);
                try (InputStream in = new FileInputStream(getApplicationInfo().sourceDir)) { copy(in, out); }
                runOnUiThread(() -> shareFile(out, "application/vnd.android.package-archive", "Passa Rebel Survival"));
                return String.format(java.util.Locale.ITALY, "%.0f", out.length() / 1048576.0);
            } catch (IOException e) {
                return "";
            }
        }

        /** Salva un file preparato dalla pagina (es. backup) e apre la condivisione: si può salvare in File o inviare. */
        @JavascriptInterface
        public boolean shareData(String name, String mime, String base64) {
            try {
                String safe = name.replaceAll("[^A-Za-z0-9._-]", "_");
                File out = new File(ShareProvider.dir(MainActivity.this), safe);
                try (OutputStream o = new FileOutputStream(out)) { o.write(Base64.decode(base64, Base64.DEFAULT)); }
                runOnUiThread(() -> shareFile(out, mime, "Salva o invia"));
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        /** Chat Bluetooth: accende la rete (chiede i permessi se servono). Il risultato arriva come evento. */
        @JavascriptInterface
        public void meshStart() {
            runOnUiThread(() -> { if (hasBt()) startMesh(); else requestPermissions(btPerms(), REQ_BT); });
        }
        /** Immagine, audio o file: peerID vuoto = tutti i vicini. Ritorna ok | handshake | wait | blocked | error. */
        @JavascriptInterface public String meshSendMedia(String peerID, String name, String mime, String base64) {
            return RsMesh.sendMedia(peerID, name, mime, base64);
        }
        @JavascriptInterface public void voiceStart() {
            runOnUiThread(() -> {
                if (has(Manifest.permission.RECORD_AUDIO)) voiceBegin();
                else requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
            });
        }
        @JavascriptInterface public void voiceStop() { runOnUiThread(MainActivity.this::voiceFinish); }
        @JavascriptInterface public void voiceAbort() { runOnUiThread(MainActivity.this::voiceCancel); }
        @JavascriptInterface public void meshStop() { RsMesh.stop(); }
        @JavascriptInterface public boolean meshRunning() { return RsMesh.INSTANCE.getRunning(); }
        @JavascriptInterface public String meshMe() { return RsMesh.myPeerID(); }
        @JavascriptInterface public String meshPeers() { return RsMesh.peersJson().toString(); }
        @JavascriptInterface public boolean meshSend(String text) { return RsMesh.sendPublic(text); }
        @JavascriptInterface public String meshSendPrivate(String peerID, String text) { return RsMesh.sendPrivate(peerID, text); }
        @JavascriptInterface public String meshNick() { String n = RsMesh.nickname(); return n == null ? "" : n; }
        @JavascriptInterface public void meshSetNick(String name) { RsMesh.setNickname(name); }

        /** Lavoro lungo della pagina (download): l'app resta viva in secondo piano, con notifica. */
        @JavascriptInterface
        public void bgStart(String title) {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= 33 && !has(Manifest.permission.POST_NOTIFICATIONS)) {
                    requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFY);
                }
                KeepAliveService.onPause = () -> runOnUiThread(() -> web.evaluateJavascript("typeof WikiModule !== \"undefined\" && WikiModule.stop()", null));
                try { KeepAliveService.start(MainActivity.this, title); } catch (Exception e) { /* senza servizio il download va solo in primo piano */ }
            });
        }
        @JavascriptInterface
        public void bgProgress(String title, String text, int pct) { KeepAliveService.progress(MainActivity.this, title, text, pct); }
        @JavascriptInterface
        public void bgStop() { KeepAliveService.stop(MainActivity.this); }

        /** Schermo sempre acceso (sostituisce Wake Lock, che la WebView non ha). */
        @JavascriptInterface
        public void keepScreenOn(boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }
    }
}
