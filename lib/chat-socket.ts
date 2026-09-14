import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/app/constants/api";

let socket: Socket | null = null;

const getSocketUrl = () => API_BASE_URL.replace(/\/api\/?$/, "");

export const getChatSocket = (): Socket => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

  const existingToken =
    socket && typeof socket.auth === "object" && socket.auth !== null
      ? (socket.auth as { token?: string }).token
      : undefined;

  // Recreate the connection whenever the authenticated user changes. A socket
  // created before login must not be reused with an empty or stale token.
  if (socket && existingToken !== (token || "")) {
    socket.disconnect();
    socket = null;
  }

  if (socket) return socket;

  socket = io(getSocketUrl(), {
    // Allow Socket.IO polling during local development and behind proxies;
    // it will upgrade to WebSocket automatically when available.
    transports: ["polling", "websocket"],
    auth: {
      token: token || "",
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected from server');
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
  });

  return socket;
};

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
