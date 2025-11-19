import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useNewPinnedMsgIndicatorStore = create(
  immer((set) => ({
    newPinnedMsgExists: {},
    addToNewPinnedMsgExists: (chatId, val) =>
      set((state) => {
        state.newPinnedMsgExists[chatId] = val;
      }),
  }))
);
