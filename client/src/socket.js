import { io } from "socket.io-client";

export const socket = io("http://localhost:8081", {
  auth: {
    serverOffset: 0,
    userId: null,
  },
  autoConnect: false,
  withCredentials: true,
});
