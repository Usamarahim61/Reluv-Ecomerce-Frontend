import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/app/constants/api";

let socket: Socket | null = null;

export const getChatSocket = (): Socket => {
  if (socket) return socket;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt") : null;

  socket = io(API_BASE_URL, {
    transports: ["websocket"],
    auth: {
      token: token || "",
    },
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
