// Rebel Survival: sostituisce WifiAwareController di bitchat-android (GPLv3).
// Il trasporto Wi-Fi Aware non è incluso: si usa solo Bluetooth.
package com.bitchat.android.wifiaware

import com.bitchat.android.mesh.MeshService

object WifiAwareController {
    fun startIfPossible() {}
    fun stop() {}
    fun setEnabled(enabled: Boolean) {}
    fun getService(): MeshService? = null
}
