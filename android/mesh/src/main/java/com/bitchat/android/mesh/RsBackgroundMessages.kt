// Rebel Survival: aggancio per i messaggi privati arrivati ad app chiusa (al posto delle notifiche di bitchat).
package com.bitchat.android.mesh

import android.content.Context

object RsBackgroundMessages {
    @Volatile var listener: ((Context, String, String, String) -> Unit)? = null
    fun onPrivateMessage(context: Context, peerID: String, nickname: String, text: String) {
        try { listener?.invoke(context, peerID, nickname, text) } catch (_: Exception) { }
    }
}
