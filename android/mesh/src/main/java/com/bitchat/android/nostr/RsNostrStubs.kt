// Rebel Survival: sostituisce le parti Nostr (messaggi via internet) di bitchat-android (GPLv3).
// Nella nostra app la chat funziona solo tra telefoni vicini via Bluetooth: queste classi non inviano nulla.
package com.bitchat.android.nostr

import android.content.Context
import com.bitchat.android.model.ReadReceipt

data class NostrIdentity(val privateKeyHex: String, val publicKeyHex: String, val npub: String, val createdAt: Long)

object NostrIdentityBridge {
    fun getCurrentNostrIdentity(context: Context): NostrIdentity? = null
}

object GeohashAliasRegistry {
    fun get(alias: String): String? = null
    fun contains(alias: String): Boolean = false
    fun snapshot(): Map<String, String> = emptyMap()
}

object GeohashConversationRegistry {
    fun get(convKey: String): String? = null
    fun snapshot(): Map<String, String> = emptyMap()
}

class NostrTransport private constructor() {
    var senderPeerID: String? = null
    fun sendPrivateMessage(content: String, to: String, recipientNickname: String, messageID: String) {}
    fun sendPrivateMessageGeohash(content: String, toRecipientHex: String, messageID: String, sourceGeohash: String? = null) {}
    fun sendReadReceipt(receipt: ReadReceipt, to: String) {}
    fun sendFavoriteNotification(to: String, isFavorite: Boolean) {}
    fun sendDeliveryAck(messageID: String, to: String) {}
    fun sendDeliveryAckGeohash(messageID: String, toRecipientHex: String, fromIdentity: NostrIdentity) {}
    companion object {
        private val INSTANCE = NostrTransport()
        fun getInstance(context: Context): NostrTransport = INSTANCE
    }
}
