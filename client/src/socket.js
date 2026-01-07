import { io } from "socket.io-client";

export const socket = io("http://localhost:8081", {
  auth: {
    serverOffset: {
      dms: {},
      groups: {},
    },
    user: null,
  },
  ackTimeout: 1000,
  retries: 3,
  autoConnect: false,
  withCredentials: true,
});
