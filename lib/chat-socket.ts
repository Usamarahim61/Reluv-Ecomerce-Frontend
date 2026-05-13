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

  return socket;
};

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
