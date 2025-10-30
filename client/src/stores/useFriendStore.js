import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useFriendStore = create(
  immer((set) => ({
    friends: [],
    addToFriends: (users) =>
      set((state) => {
        state.friends.push(...users);
        state.friends.sort(
          (a, b) => a.display_name.toUpperCase() - b.display_name.toUpperCase()
        );
      }),
    removeFromFriends: (userId) =>
      set((state) => {
        const filtered = state.friends.filter(({ id }) => id != userId);
        return filtered;
      }),
  }))
);
