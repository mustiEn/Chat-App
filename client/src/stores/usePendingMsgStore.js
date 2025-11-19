import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const usePendingMsgStore = create(
  immer((set) => ({
    pendingMsgs: {},
    addToPendingMsgs: (chatId, pendingMsg) =>
      set((state) => {
        if (!state.pendingMsgs[chatId]) state.pendingMsgs[chatId] = [];
        state.pendingMsgs[chatId].push(pendingMsg);
      }),
    removeFromPendingMsgs: (chatId, clientOffset) =>
      set((state) => {
        state.pendingMsgs[chatId] = state.pendingMsgs[chatId].filter(
          (e) => e.clientOffset != clientOffset
        );
      }),
  }))
);
