import { io } from "socket.io-client";

export const socket = io("http://localhost:8081", {
  auth: {
    serverOffset: 0,
    receiverId: null,
    userId: null,
  },
  ackTimeout: 500,
  retries: 3,
  autoConnect: false,
  withCredentials: true,
});
