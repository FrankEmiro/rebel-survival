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
            if (message.type != BitchatMessageType.Message || message.sender == "system") return
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
