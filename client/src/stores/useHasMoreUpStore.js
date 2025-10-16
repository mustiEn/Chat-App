import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useHasMoreUpStore = create(
  immer((set) => ({
    hasMoreUp: {},
    addToHasMoreUp: (receiverId, val) =>
      set((prev) => {
        prev.hasMoreUp[receiverId] = val;
      }),
  }))
);
