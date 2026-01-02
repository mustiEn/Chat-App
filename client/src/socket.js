import { io } from "socket.io-client";

export const socket = io("http://localhost:8081", {
  auth: {
    serverOffset: {
      dm: {},
      group: {},
    },
    user: null,
  },
  ackTimeout: 3000,
  retries: 1,
  autoConnect: false,
  withCredentials: true,
});
