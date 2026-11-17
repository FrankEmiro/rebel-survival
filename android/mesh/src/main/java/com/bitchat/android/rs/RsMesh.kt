// Rebel Survival: ponte semplice tra l'app (Java + pagina web) e la rete Bluetooth di bitchat.
// Licenza GPLv3 come il resto di questo modulo.
// Eventi verso l'app: stringhe JSON {type: 'msg'|'peers'|'ack'|'read'|'state', ...}.
package com.bitchat.android.rs

import android.content.Context
import com.bitchat.android.mesh.MeshDelegate
import com.bitchat.android.mesh.MeshService
import com.bitchat.android.model.BitchatMessage
import com.bitchat.android.model.BitchatMessageType
import com.bitchat.android.service.MeshServiceHolder
import org.json.JSONArray
import org.json.JSONObject

fun interface RsMeshListener { fun onEvent(json: String) }

object RsMesh {
    private const val PREFS = "rs_mesh"
    private var mesh: MeshService? = null
    private var appContext: Context? = null
    @Volatile var listener: RsMeshListener? = null
    @Volatile var running = false
        private set

    private fun emit(o: JSONObject) { try { listener?.onEvent(o.toString()) } catch (_: Exception) { } }

    private fun initOnce(ctx: Context) {
        if (appContext != null) return
        appContext = ctx.applicationContext
        val c = appContext!!
        try { com.bitchat.android.mesh.PowerManager.getInstance(c).start() } catch (_: Exception) { }
        try { com.bitchat.android.favorites.FavoritesPersistenceService.initialize(c) } catch (_: Exception) { }
        try { com.bitchat.android.services.AppStateStore.initializeConversationPersistence(c) } catch (_: Exception) { }
        try { com.bitchat.android.ui.debug.DebugPreferenceManager.init(c) } catch (_: Exception) { }
        try { com.bitchat.android.service.MeshServicePreferences.init(c) } catch (_: Exception) { }
    }

    private val delegate = object : MeshDelegate {
        override fun didReceiveMessage(message: BitchatMessage) {
            if (message.sender == "system") return
            if (message.type != BitchatMessageType.Message) { emitMedia(message); return }
            emit(JSONObject()
                .put("type", "msg").put("id", message.id)
                .put("from", message.senderPeerID ?: "").put("nick", message.sender)
                .put("text", message.content).put("ts", message.timestamp.time)
                .put("private", message.isPrivate))
        }
        override fun didUpdatePeerList(peers: List<String>) { emit(peersJson()) }
        override fun didReceiveChannelLeave(channel: String, fromPeer: String) {}
        override fun didReceiveDeliveryAck(messageID: String, recipientPeerID: String) {
            emit(JSONObject().put("type", "ack").put("id", messageID).put("peer", recipientPeerID))
        }
        override fun didReceiveReadReceipt(messageID: String, recipientPeerID: String) {
            emit(JSONObject().put("type", "read").put("id", messageID).put("peer", recipientPeerID))
        }
        override fun decryptChannelMessage(encryptedContent: ByteArray, channel: String): String? = null
        override fun getNickname(): String? = nickname()
        override fun isFavorite(peerID: String): Boolean = false
    }

    /** Oltre questa dimensione il file ricevuto non viene passato alla pagina (resta solo l'avviso). */
    private const val MAX_EMIT_BYTES = 1_500_000L

    /** Immagine, audio o file ricevuto: la pagina lo riceve come base64 e lo salva da sé. */
    private fun emitMedia(message: BitchatMessage) {
        try {
            val f = java.io.File(message.content)
            val kind = when (message.type) {
                BitchatMessageType.Image -> "image"
                BitchatMessageType.Audio -> "audio"
                else -> "file"
            }
            val o = JSONObject()
                .put("type", "media").put("id", message.id).put("kind", kind)
                .put("from", message.senderPeerID ?: "").put("nick", message.sender)
                .put("name", f.name).put("size", f.length()).put("ts", message.timestamp.time)
                .put("private", message.isPrivate)
            if (f.exists() && f.length() <= MAX_EMIT_BYTES) {
                o.put("data", android.util.Base64.encodeToString(f.readBytes(), android.util.Base64.NO_WRAP))
                o.put("mime", mimeFor(f.name, kind))
            } else o.put("tooBig", true)
            try { f.delete() } catch (_: Exception) { }   // la pagina ne tiene una copia: niente file in giro
            emit(o)
        } catch (_: Exception) { }
    }

    private fun mimeFor(name: String, kind: String): String {
        val n = name.lowercase()
        return when {
            n.endsWith(".png") -> "image/png"
            n.endsWith(".webp") -> "image/webp"
            n.endsWith(".jpg") || n.endsWith(".jpeg") -> "image/jpeg"
            n.endsWith(".m4a") || n.endsWith(".mp4") || n.endsWith(".aac") -> "audio/mp4"
            n.endsWith(".ogg") || n.endsWith(".opus") -> "audio/ogg"
            n.endsWith(".mp3") -> "audio/mpeg"
            n.endsWith(".wav") -> "audio/wav"
            n.endsWith(".pdf") -> "application/pdf"
            n.endsWith(".txt") -> "text/plain"
            kind == "image" -> "image/jpeg"
            kind == "audio" -> "audio/mp4"
            else -> "application/octet-stream"
        }
    }

    /**
     * Invia un file (immagine, audio, documento). peerID vuoto = tutti i vicini (non cifrato),
     * altrimenti messaggio privato cifrato. Ritorna: ok | handshake (riprova tra poco) | wait | blocked | error.
     */
    @JvmStatic fun sendMedia(peerID: String, name: String, mime: String, base64: String): String {
        val m = mesh ?: return "error"
        return try {
            val bytes = android.util.Base64.decode(base64, android.util.Base64.DEFAULT)
            val file = com.bitchat.android.model.BitchatFilePacket(name.take(120), bytes.size.toLong(), mime, bytes)
            if (peerID.isEmpty()) { m.sendFileBroadcast(file); "ok" }
            else {
                val id = java.util.UUID.randomUUID().toString().uppercase()
                when (val p = m.prepareFilePrivate(peerID, file, id, false)) {
                    is com.bitchat.android.mesh.PrivateMediaPreparation.Ready -> if (p.transfer.commit()) "ok" else "error"
                    com.bitchat.android.mesh.PrivateMediaPreparation.NeedsHandshake -> { m.initiateNoiseHandshake(peerID); "handshake" }
                    com.bitchat.android.mesh.PrivateMediaPreparation.AwaitingPeerState -> "wait"
                    else -> "blocked"
                }
            }
        } catch (_: Exception) { "error" }
    }

    private var prefsContext: Context? = null
    /** Da chiamare all'avvio dell'app: serve solo per leggere e salvare il nome (non accende il Bluetooth). */
    @JvmStatic fun attach(ctx: Context) { prefsContext = ctx.applicationContext }
    private fun prefs() = (appContext ?: prefsContext)?.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    @JvmStatic fun nickname(): String? = prefs()?.getString("nickname", null)

    @JvmStatic fun setNickname(name: String) {
        prefs()?.edit()?.putString("nickname", name.trim().take(32))?.apply()
        try { mesh?.sendBroadcastAnnounce() } catch (_: Exception) { }
    }

    /** Avvia la rete (servono già i permessi Bluetooth). */
    @JvmStatic fun start(ctx: Context) {
        initOnce(ctx)
        val m = MeshServiceHolder.getUnifiedOrCreate(appContext!!)
        mesh = m
        m.delegate = delegate
        if (!running) { m.startServices(); running = true }
        emit(JSONObject().put("type", "state").put("running", true).put("me", m.myPeerID))
        emit(peersJson())
    }

    @JvmStatic fun stop() {
        try { mesh?.stopServices() } catch (_: Exception) { }
        running = false
        emit(JSONObject().put("type", "state").put("running", false))
    }

    @JvmStatic fun myPeerID(): String = mesh?.myPeerID ?: ""

    /** Messaggio a tutti i vicini (non cifrato, come il canale pubblico di bitchat). */
    @JvmStatic fun sendPublic(text: String): Boolean {
        val m = mesh ?: return false
        m.sendMessage(text.take(2000))
        return true
    }

    /** Messaggio privato cifrato a una persona (Noise). Ritorna l'id del messaggio. */
    @JvmStatic fun sendPrivate(peerID: String, text: String): String {
        val m = mesh ?: return ""
        val id = java.util.UUID.randomUUID().toString().uppercase()
        val nick = m.getPeerNicknames()[peerID] ?: peerID
        m.sendPrivateMessage(text.take(2000), peerID, nick, id)
        return id
    }

    @JvmStatic fun peersJson(): JSONObject {
        val arr = JSONArray()
        try { mesh?.getPeerNicknames()?.forEach { (id, nick) -> arr.put(JSONObject().put("id", id).put("nick", nick)) } } catch (_: Exception) { }
        return JSONObject().put("type", "peers").put("peers", arr)
    }
}
