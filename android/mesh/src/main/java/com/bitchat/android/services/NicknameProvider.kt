package com.bitchat.android.services

import android.content.Context

/**
 * Provides current user's nickname for announcements and leave messages.
 * If no nickname saved, falls back to the provided peerID.
 */
object NicknameProvider {
    fun getNickname(context: Context, myPeerID: String): String {
        return try {
            // Rebel Survival: il nome scelto nella chat è salvato qui (vedi RsMesh)
            val nick = context.getSharedPreferences("rs_mesh", Context.MODE_PRIVATE).getString("nickname", null)
            if (nick.isNullOrBlank()) myPeerID else nick
        } catch (_: Exception) {
            myPeerID
        }
    }
}

