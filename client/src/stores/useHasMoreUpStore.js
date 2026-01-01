import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useHasMoreUpStore = create(
  immer((set) => ({
    hasMoreUp: {
      dm: {},
      group: {},
    },
    addToDmHasMoreUp: (chatId, val) =>
      set((state) => {
        state.hasMoreUp.dm[chatId] = val;
      }),
    addToGroupHasMoreUp: (groupId, val) =>
      set((state) => {
        state.hasMoreUp.group[groupId] = val;
      }),
  }))
);
