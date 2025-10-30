import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useFriendRequestStore = create(
  immer((set) => ({
    friendRequests: {
      sentRequests: [],
      receivedRequests: [],
    },
    addSentRequest: (newMsgRequest) =>
      set((state) => {
        state.friendRequests.sentRequests.push(newMsgRequest);
      }),
    addReceivedRequest: (newMsgRequest) =>
      set((state) => {
        state.friendRequests.receivedRequests.unshift(...newMsgRequest);
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
