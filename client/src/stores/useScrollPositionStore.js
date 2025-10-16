import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useScrollPositionStore = create(
  immer((set) => ({
    scrollPosition: {},
    addToscrollPosition: (receiverId, val) =>
      set((prev) => {
        prev.scrollPosition[receiverId] = val;
      }),
  }))
);
