import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useShowPinnedMsgBoxStore = create(
  immer((set) => ({
    showPinnedMsgBox: {},
    addToShowPinnedMsgBox: (chatId, val) =>
      set((state) => {
        state.showPinnedMsgBox[chatId] = val;
      }),
  }))
);
