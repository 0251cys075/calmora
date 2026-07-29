/**
 * @file safe-circle.js
 * @description Socket.IO handler for Safe Circle — anonymous 1-on-1 peer support.
 * Manages topic-based matching queue, message relay, session lifecycle,
 * and WebRTC signaling for voice/video calls.
 * No transcripts or call content are stored.
 */

const adjectives = [
  "Quiet","Calm","Gentle","Peace","Soft","Warm","Brave","Kind",
  "Wise","Deep","Pure","True","Free","Light","Still","Bright",
]
const animals = [
  "Owl","Panda","Fox","Bear","Wolf","Deer","Dove","Robin",
  "Lark","Finch","Hare","Fern","Star","Moon","Oak","Reed",
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function generateAnonUsername() {
  return `${pick(adjectives)}${pick(animals)}${Math.floor(Math.random() * 99) + 10}`
}

const TOPICS = ["Anxiety","Depression","Stress","Loneliness","Grief"]

// In-memory queues per topic: [{ socketId, username }]
const queues = Object.fromEntries(TOPICS.map((t) => [t, []]))

// Active sessions: sessionId -> { sessionId, peerA: { socketId, username }, peerB: { socketId, username }, topic, startTime, flagged, flaggedKeywords }
const sessions = {}

// Reverse lookup: socketId -> sessionId
const socketSession = {}

let sessionCounter = 0

function createSessionId() {
  sessionCounter++
  return `sc_${Date.now()}_${sessionCounter}`
}

function removeFromQueue(socketId) {
  for (const topic of TOPICS) {
    const idx = queues[topic].findIndex((e) => e.socketId === socketId)
    if (idx !== -1) {
      queues[topic].splice(idx, 1)
      return true
    }
  }
  return false
}

function handleDisconnect(io, socket) {
  const sessionId = socketSession[socket.id]
  if (sessionId) {
    const session = sessions[sessionId]
    if (session) {
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (io.sockets.sockets.has(peer.socketId)) {
        io.to(peer.socketId).emit("peer_left", { reason: "disconnected" })
      }
      delete sessions[sessionId]
    }
    delete socketSession[socket.id]
  }
  removeFromQueue(socket.id)
}

module.exports = function registerSafeCircle(io) {
  const nsp = io.of("/safe-circle")

  nsp.on("connection", (socket) => {
    console.log(`[SafeCircle] Connected: ${socket.id}`)

    socket.on("find_match", ({ topic, username }) => {
      if (!topic || !TOPICS.includes(topic)) {
        socket.emit("error", { message: "Invalid topic" })
        return
      }

      const displayName = username || generateAnonUsername()

      // Check if there's someone waiting in the queue for this topic
      const queue = queues[topic]
      if (queue.length > 0) {
        const peer = queue.shift()
        // Ensure peer is still connected
        if (!nsp.sockets.has(peer.socketId)) {
          // Peer disconnected, put ourselves in queue instead
          queue.push({ socketId: socket.id, username: displayName })
          socket.emit("queued", { topic, position: queue.length })
          return
        }

        const sessionId = createSessionId()
        const session = {
          sessionId,
          topic,
          startTime: Date.now(),
          endTime: null,
          flagged: false,
          flaggedKeywords: [],
          peerA: { socketId: socket.id, username: displayName },
          peerB: { socketId: peer.socketId, username: peer.username },
        }
        sessions[sessionId] = session
        socketSession[socket.id] = sessionId
        socketSession[peer.socketId] = sessionId

        // Notify both peers
        nsp.to(socket.id).emit("matched", {
          sessionId,
          peerUsername: peer.username,
          topic,
          isPeerA: true,
        })
        nsp.to(peer.socketId).emit("matched", {
          sessionId,
          peerUsername: displayName,
          topic,
          isPeerA: false,
        })
        console.log(`[SafeCircle] Matched: ${displayName} <-> ${peer.username} on ${topic}`)
      } else {
        // No one waiting — join queue with 60s timeout
        queue.push({ socketId: socket.id, username: displayName })
        socket.emit("queued", { topic, position: 1 })

        setTimeout(() => {
          const stillInQueue = queues[topic].some((e) => e.socketId === socket.id)
          if (stillInQueue) {
            removeFromQueue(socket.id)
            socket.emit("match_timeout", { message: "No one available right now. Try again shortly." })
          }
        }, 60000)
      }
    })

    socket.on("cancel_match", () => {
      removeFromQueue(socket.id)
      socket.emit("match_cancelled")
    })

    socket.on("send_message", ({ sessionId, text }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) {
        nsp.to(peer.socketId).emit("peer_message", {
          text,
          timestamp: Date.now(),
        })
      }
    })

    socket.on("typing", ({ sessionId }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) {
        nsp.to(peer.socketId).emit("peer_typing")
      }
    })

    socket.on("end_session", ({ sessionId }) => {
      const session = sessions[sessionId]
      if (!session) {
        delete socketSession[socket.id]
        return
      }
      session.endTime = Date.now()
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) {
        nsp.to(peer.socketId).emit("peer_left", { reason: "ended" })
      }
      delete sessions[sessionId]
      delete socketSession[socket.id]
      delete socketSession[peer.socketId]
      socket.emit("session_ended")
    })

    // WebRTC signaling for voice
    socket.on("voice_offer", ({ sessionId, sdp }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) {
        nsp.to(peer.socketId).emit("voice_offer", { sdp })
      }
    })

    socket.on("voice_answer", ({ sessionId, sdp }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) {
        nsp.to(peer.socketId).emit("voice_answer", { sdp })
      }
    })

    socket.on("voice_ice", ({ sessionId, candidate }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) {
        nsp.to(peer.socketId).emit("voice_ice", { candidate })
      }
    })

    socket.on("voice_accept", ({ sessionId }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) {
        nsp.to(peer.socketId).emit("voice_accepted")
      }
    })

    socket.on("voice_decline", ({ sessionId }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) {
        nsp.to(peer.socketId).emit("voice_declined")
      }
    })

    socket.on("voice_end", ({ sessionId }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) {
        nsp.to(peer.socketId).emit("voice_ended")
      }
    })

    // WebRTC signaling for video (same pattern, separate events for gating)
    socket.on("video_offer", ({ sessionId, sdp }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) nsp.to(peer.socketId).emit("video_offer", { sdp })
    })

    socket.on("video_answer", ({ sessionId, sdp }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) nsp.to(peer.socketId).emit("video_answer", { sdp })
    })

    socket.on("video_ice", ({ sessionId, candidate }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) nsp.to(peer.socketId).emit("video_ice", { candidate })
    })

    socket.on("video_accept", ({ sessionId }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) nsp.to(peer.socketId).emit("video_accepted")
    })

    socket.on("video_decline", ({ sessionId }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) nsp.to(peer.socketId).emit("video_declined")
    })

    socket.on("video_end", ({ sessionId }) => {
      const session = sessions[sessionId]
      if (!session) return
      const peer = session.peerA.socketId === socket.id ? session.peerB : session.peerA
      if (nsp.sockets.has(peer.socketId)) nsp.to(peer.socketId).emit("video_ended")
    })

    socket.on("report_session", ({ sessionId, keywords }) => {
      const session = sessions[sessionId]
      if (!session) return
      session.flagged = true
      if (keywords) session.flaggedKeywords = [...new Set([...session.flaggedKeywords, ...keywords])]
      // In production: persist flagged session metadata to DB here
      // Peer notification already handled via crisis popup triggered by the reporter
    })

    socket.on("disconnect", () => {
      handleDisconnect(nsp, socket)
    })
  })
}
