import { io } from "socket.io-client";

// Connect to local Node.js Express server on port 5000
const SOCKET_URL = "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect until explicitly instructed or user logs in
  reconnectionAttempts: 5,
  timeout: 10000,
});

/**
 * Connects the WebSocket client and registers the current authenticated user.
 * @param {Object} user User data containing name, email, and role (guide, tourist, admin)
 */
export function connectSocket(user) {
  if (!socket.connected) {
    socket.connect();
  }

  // Register user details on the backend
  socket.emit("register", {
    name: user.name,
    email: user.email,
    role: user.role,
    guideId: user.role === "guide" ? user.guideId || 1 : null // Mock mapping guideId to 1 for first guide, etc.
  });

  console.log(`[WEBSOCKET] Requested connection and registered user: ${user.name} (${user.role})`);
}

/**
 * Disconnects the socket client on user logout.
 */
export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
    console.log("[WEBSOCKET] Client explicitly disconnected");
  }
}
