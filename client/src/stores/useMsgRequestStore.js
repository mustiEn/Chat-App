import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useMsgRequestStore = create(
  immer((set) => ({
    msgRequests: {
      fromMe: [],
      fromOthers: [],
    },
    addToMyRequests: (newMsgRequest) =>
      set((state) => {
        state.msgRequests.fromMe.push(...newMsgRequest);
      }),
    addToOthersRequests: (newMsgRequest) =>
      set((state) => {
        state.msgRequests.fromOthers.push(...newMsgRequest);
      }),
    removeFromMyRequests: (userId) =>
      set((state) => {
        state.msgRequests.fromMe = state.msgRequests.fromMe.filter(
          ({ to_id }) => to_id != userId
        );
      }),
    removeFromOthersRequests: (userId) =>
      set((state) => {
        state.msgRequests.fromOthers = state.msgRequests.fromOthers.filter(
          ({ from_id }) => from_id != userId
        );
      }),
  }))
);
