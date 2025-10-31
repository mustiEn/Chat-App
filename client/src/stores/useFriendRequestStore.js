import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useFriendRequestStore = create(
  immer((set) => ({
    friendRequests: {
      sentRequests: [],
      receivedRequests: [],
    },
    addSentRequest: (userIds) =>
      set((state) => {
        state.friendRequests.sentRequests.push(...userIds);
      }),
    addReceivedRequest: (users) =>
      set((state) => {
        state.friendRequests.receivedRequests.unshift(...users);
      }),
    removeSentRequest: (userId) =>
      set((state) => {
        state.friendRequests.sentRequests =
          state.friendRequests.sentRequests.filter((id) => id != userId);
      }),
    removeReceivedRequest: (userId) =>
      set((state) => {
        state.friendRequests.receivedRequests =
          state.friendRequests.receivedRequests.filter(
            ({ id }) => id != userId
          );
      }),
  }))
);
