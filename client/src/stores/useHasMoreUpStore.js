import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useHasMoreUpStore = create(
  immer((set) => ({
    hasMoreUp: {},
    addToHasMoreUp: (chatId, val) =>
      set((state) => {
        state.hasMoreUp[chatId] = val;
      }),
  }))
);
