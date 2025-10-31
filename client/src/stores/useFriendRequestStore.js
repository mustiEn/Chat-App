import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useFriendRequestStore = create(
  immer((set) => ({
    friendRequests: {
      sentRequests: [],
      receivedRequests: [],
    },
    addSentRequest: (userId) =>
      set((state) => {
        state.friendRequests.sentRequests.push(userId);
      }),
    addReceivedRequest: (users) =>
      set((state) => {
        state.friendRequests.receivedRequests.unshift(...users);
      }),
    removeSentRequest: (userId) =>
      set((state) => {
        state.friendRequests.sentRequests =
          state.friendRequests.sentRequests.filter(
            ({ to_id }) => to_id != userId
          );
      }),
    removeReceivedRequest: (userId) =>
      set((state) => {
        state.friendRequests.receivedRequests =
          state.friendRequests.receivedRequests.filter(
            ({ from_id }) => from_id != userId
          );
      }),
  }))
);
