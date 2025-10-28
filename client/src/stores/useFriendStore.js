import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useFriendStore = create(
  immer((set) => ({
    friends: [],
    addToFriends: (users) =>
      set((state) => {
        state.friends.push(...users);
        state.friends.sort((a, b) => a - b);
      }),
    removeFromFriends: (user) =>
      set((state) => {
        state.friends.filter(({ id }) => id != user.id);
      }),
  }))
);
