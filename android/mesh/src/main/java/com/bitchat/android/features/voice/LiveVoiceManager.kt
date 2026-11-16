// Rebel Survival: sostituisce LiveVoiceManager di bitchat-android (GPLv3).
// La voce in diretta non è inclusa: i frammenti vocali vengono ignorati.
package com.bitchat.android.features.voice

import android.content.Context
import com.bitchat.android.model.BitchatMessage

enum class LiveVoiceScope { DIRECT_MESSAGE, PUBLIC_MESH }

class LiveVoiceManager private constructor() {
    fun handleFrame(peerID: String, nickname: String, scope: LiveVoiceScope, payload: ByteArray, timestampMs: Long): Boolean = false
    fun absorbFinalizedVoiceNote(message: BitchatMessage): Boolean = false
    companion object {
        private val instance = LiveVoiceManager()
        fun getInstance(context: Context): LiveVoiceManager = instance
    }
}
