import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useReceiverStore = create(
  immer((set) => ({
    receivers: {},
    addToReceivers: (receiverId, val) =>
      set((prev) => {
        prev.receiver[receiverId] = val;
      }),
  }))
);
