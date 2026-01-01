import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const usePendingMsgStore = create(
  immer((set) => ({
    pendingMsgs: {
      dm: {},
      group: {},
    },
    addToDmPendingMsgs: (chatId, pendingMsg) =>
      set((state) => {
        if (!state.pendingMsgs.dm[chatId]) state.pendingMsgs.dm[chatId] = [];
        state.pendingMsgs.dm[chatId].push(pendingMsg);
      }),
    removeFromDmPendingMsgs: (chatId, clientOffset) =>
      set((state) => {
        state.pendingMsgs.dm[chatId] = state.pendingMsgs.dm[chatId].filter(
          (e) => e.clientOffset != clientOffset
        );
      }),
    addToGroupPendingMsgs: (groupId, pendingMsg) =>
      set((state) => {
        if (!state.pendingMsgs.group[groupId])
          state.pendingMsgs.group[groupId] = [];
        state.pendingMsgs.group[groupId].push(pendingMsg);
      }),
    removeFromGroupPendingMsgs: (groupId, clientOffset) =>
      set((state) => {
        state.pendingMsgs.group[groupId] = state.pendingMsgs.group[
          groupId
        ].filter((e) => e.clientOffset != clientOffset);
      }),
  }))
);
