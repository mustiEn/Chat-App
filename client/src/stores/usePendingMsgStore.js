import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const usePendingMsgStore = create(
  immer((set) => ({
    pendingMsgs: {},
    addToPendingMsgs: (receiverId, pendingMsg) =>
      set((state) => {
        if (!state.pendingMsgs[receiverId]) state.pendingMsgs[receiverId] = [];
        state.pendingMsgs[receiverId].push(pendingMsg);
      }),
    removeFromPendingMsgs: (receiverId, clientOffset) =>
      set((state) => {
        state.pendingMsgs[receiverId] = state.pendingMsgs[receiverId].filter(
          (e) => e.clientOffset != clientOffset
        );
      }),
  }))
);
