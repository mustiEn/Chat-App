import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useHasMoreUpStore = create(
  immer((set) => ({
    hasMoreUp: {},
    addToHasMoreUp: (receiverId, val) =>
      set((state) => {
        state.hasMoreUp[receiverId] = val;
      }),
  }))
);
