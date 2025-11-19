import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useReceiverStore = create(
  immer((set) => ({
    receivers: {},
    addToReceivers: (chatId, val) =>
      set((state) => {
        // if(!state.receivers[chatId]) state.receivers
        state.receivers[chatId] = val;
      }),
  }))
);
