import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useDmHistoryUserStore = create(
  immer((set) => ({
    dmHistoryUsers: [],
    addToDmHistoryUsers: (users) =>
      set((prev) => {
        prev.dmHistoryUsers.unshift(...users);
      }),
    removeFromDmHistoryUsers: (user) =>
      set((prev) => {
        prev.dmHistoryUsers.filter(({ id }) => id != user.id);
      }),
  }))
);
