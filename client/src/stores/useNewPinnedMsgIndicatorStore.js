import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useNewPinnedMsgIndicatorStore = create(
  immer((set) => ({
    newPinnedMsgExists: {
      dm: {},
      group: {},
    },
    setDmPinnedMsgExists: (chatId, val) =>
      set((state) => {
        state.newPinnedMsgExists.dm[chatId] = val;
      }),
    setGroupPinnedMsgExists: (groupId, val) =>
      set((state) => {
        state.newPinnedMsgExists.group[groupId] = val;
      }),
  }))
);
