import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useReceiverStore = create(
  immer((set) => ({
    receivers: {},
    addReceiver: (receiverId, receiver) =>
      set((state) => {
        // if(!state.receivers[receiverId]) state.receivers
        state.receivers[receiverId] = receiver;
      }),
    blockReceiver: (receiverId, blockedBy) =>
      set((state) => {
        state.receivers[receiverId].isBlocked = true;
        state.receivers[receiverId].blockedBy = blockedBy;
      }),
    unblockReceiver: (receiverId) =>
      set((state) => {
        state.receivers[receiverId].isBlocked = false;
        delete state.receivers[receiverId].blockedBy;
      }),
    setStatus: (receiverId, status) =>
      set((state) => {
        state.receivers[receiverId].status = status;
      }),
  }))
);
