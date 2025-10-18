import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useNewPinnedMsgIndicatorStore = create(
  immer((set) => ({
    newPinnedMsgExists: {},
    addToNewPinnedMsgExists: (receiverId, val) =>
      set((state) => {
        state.newPinnedMsgExists[receiverId] = val;
      }),
  }))
);
