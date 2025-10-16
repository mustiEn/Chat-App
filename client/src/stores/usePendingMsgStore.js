import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const usePendingMsgStore = create(
  immer((set) => ({
    pendingMsgs: {},
    addToPendingMsgs: (pendingMsg) =>
      set((prev) => {
        prev.pendingMsgs.push(pendingMsg);
      }),
    removeFromPendingMsgs: (pendingMsg) =>
      set((prev) => {
        prev.pendingMsgs = prev.pendingMsgs.filter(
          ({ clientOffset }) => clientOffset != pendingMsg.clientOffset
        );
      }),
  }))
);
