package it.cyberrebellion.rebelsurvival;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

/**
 * Tiene viva l'app mentre la pagina fa un lavoro lungo (per ora: download di Wikipedia),
 * anche se l'utente passa a un'altra app o spegne lo schermo.
 * Il download resta nella pagina (wiki.js): questo servizio mostra la notifica con
 * l'avanzamento e impedisce ad Android di congelare l'app e di spegnere CPU e Wi‑Fi.
 * Lo comandano RSAndroid.bgStart / bgProgress / bgStop.
 */
public class KeepAliveService extends Service {
    static final String CHANNEL = "rs_download";
    static final int ID = 7101;
    static final long MAX_MS = 6L * 60 * 60 * 1000;   // limite di sicurezza: 6 ore

    static volatile boolean running = false;
    private PowerManager.WakeLock cpu;
    private WifiManager.WifiLock wifi;

    static void start(Context c, String title) {
        Intent i = new Intent(c, KeepAliveService.class).putExtra("title", title).putExtra("text", "Preparo…").putExtra("pct", -1);
        c.startForegroundService(i);
    }

    static void progress(Context c, String title, String text, int pct) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (running && nm != null) nm.notify(ID, build(c, title, text, pct));
    }

    static void stop(Context c) { c.stopService(new Intent(c, KeepAliveService.class)); }

    static Notification build(Context c, String title, String text, int pct) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm != null && nm.getNotificationChannel(CHANNEL) == null) {
            nm.createNotificationChannel(new NotificationChannel(CHANNEL, "Download", NotificationManager.IMPORTANCE_LOW));
        }
        Intent open = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        PendingIntent pi = PendingIntent.getActivity(c, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification.Builder b = new Notification.Builder(c, CHANNEL)
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .setContentTitle(title)
                .setContentText(text)
                .setContentIntent(pi)
                .setOngoing(true)
                .setOnlyAlertOnce(true);
        if (pct >= 0) b.setProgress(100, pct, false); else b.setProgress(0, 0, true);
        return b.build();
    }

    @Override
    public int onStartCommand(Intent i, int flags, int startId) {
        String title = i != null && i.getStringExtra("title") != null ? i.getStringExtra("title") : "Download in corso";
        String text = i != null && i.getStringExtra("text") != null ? i.getStringExtra("text") : "";
        Notification n = build(this, title, text, i != null ? i.getIntExtra("pct", -1) : -1);
        if (Build.VERSION.SDK_INT >= 29) startForeground(ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
        else startForeground(ID, n);
        running = true;
        if (cpu == null) {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            cpu = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "RebelSurvival:download");
            cpu.acquire(MAX_MS);
        }
        if (wifi == null) {
            WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
            if (wm != null) {
                wifi = wm.createWifiLock(Build.VERSION.SDK_INT >= 29 ? WifiManager.WIFI_MODE_FULL_HIGH_PERF : WifiManager.WIFI_MODE_FULL, "RebelSurvival:download");
                wifi.acquire();
            }
        }
        return START_NOT_STICKY;   // se Android chiude l'app, il download si riprende a mano («Riprendi»)
    }

    // Android 15: superato il tempo concesso ai servizi dataSync, si ferma da solo
    @Override public void onTimeout(int startId, int fgsType) { stopSelf(); }

    @Override
    public void onDestroy() {
        running = false;
        if (cpu != null && cpu.isHeld()) cpu.release();
        if (wifi != null && wifi.isHeld()) wifi.release();
        cpu = null; wifi = null;
        stopForeground(STOP_FOREGROUND_REMOVE);
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent i) { return null; }
}
