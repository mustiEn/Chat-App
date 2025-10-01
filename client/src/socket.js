import { io } from "socket.io-client";

export const socket = io("http://localhost:8081", {
  auth: {
    serverOffset: 0,
    receiverId: null,
    userId: null,
  },
  ackTimeout: 5000,
  retries: 5,
  autoConnect: false,
  withCredentials: true,
});
