import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useShowPinnedMsgBoxStore = create(
  immer((set) => ({
    pinnedMsgBoxObj: {
      dm: {},
      group: {},
    },
    switchDmPinnedMsgBox: (chatId, val) =>
      set((state) => {
        state.pinnedMsgBoxObj.dm[chatId] = val;
      }),
    switchGroupPinnedMsgBox: (groupId, val) =>
      set((state) => {
        state.pinnedMsgBoxObj.group[groupId] = val;
      }),
  }))
);
