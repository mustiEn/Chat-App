import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useFriendStore = create(
  immer((set) => ({
    friends: [],
    addToFriends: (users) =>
      set((state) => {
        const existingIds = new Set(state.friends.map(({ id }) => id));
        const uniqueUsers = users.filter(({ id }) => !existingIds.has(id));
        state.friends.push(...uniqueUsers);
        state.friends.sort((a, b) =>
          a.display_name.localeCompare(b.display_name, undefined, {
            sensitivity: "base",
          })
        );
      }),
    removeFromFriends: (userId) =>
      set((state) => {
        const filtered = state.friends.filter(({ id }) => id != userId);
        return filtered;
      }),
  }))
);
