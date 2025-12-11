import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useGroupStore = create(
  immer((set) => ({
    groups: {},
    addToGroups: (groupId, group) =>
      set((state) => {
        state.groups[groupId] = group;
      }),
    addGroup: (groupId) =>
      set((state) => {
        delete state.groups[groupId];
      }),
  }))
);
