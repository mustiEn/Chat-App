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
        const vals = state.friendRequests.sentRequests;
        const uniqueIds = userIds.filter((id) => !vals.some((e) => e == id));

        state.friendRequests.sentRequests.push(...uniqueIds);
      }),
    addReceivedRequest: (users) =>
      set((state) => {
        const vals = state.friendRequests.receivedRequests;
        const uniqueUsers = users.filter(
          ({ id }) => !vals.some((e) => e.id == id)
        );

        state.friendRequests.receivedRequests.unshift(...uniqueUsers);
      }),
    removeSentRequest: (userId) =>
      set((state) => {
        const vals = state.friendRequests.sentRequests;

        state.friendRequests.sentRequests = vals.filter((id) => id != userId);
      }),
    removeReceivedRequest: (userId) =>
      set((state) => {
        const vals = state.friendRequests.receivedRequests;

        state.friendRequests.receivedRequests = vals.filter(
          ({ id }) => id != userId
        );
      }),
  }))
);
