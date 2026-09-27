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
    // Prefer WebSocket for lower latency; fall back to polling on networks
    // that block WebSocket upgrades.
    transports: ["websocket", "polling"],
    auth: {
      token: token || "",
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected to server");
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected from server");
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error.message);
  });

  return socket;
};

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
