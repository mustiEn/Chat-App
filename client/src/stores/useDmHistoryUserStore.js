import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useDmHistoryUserStore = create(
  immer((set) => ({
    dmHistoryUsers: [],
    addToDmHistoryUsers: (users) =>
      set((state) => {
        state.dmHistoryUsers.unshift(...users);
      }),
    removeFromDmHistoryUsers: (user) =>
      set((state) => {
        state.dmHistoryUsers.filter(({ id }) => id != user.id);
      }),
  }))
);
