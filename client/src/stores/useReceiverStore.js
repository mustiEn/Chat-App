import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useReceiverStore = create(
  immer((set) => ({
    receivers: {},
    addToReceivers: (receiverId, val) =>
      set((state) => {
        // if(!state.receivers[receiverId]) state.receivers
        state.receivers[receiverId] = val;
      }),
  }))
);
