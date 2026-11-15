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

    private static final int REQ_LOCATION = 1, REQ_CAMERA = 2, REQ_FILE = 3;

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

        web.addJavascriptInterface(new Bridge(), "RSAndroid");
        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome());

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

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
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
