import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useMsgRequestStore = create(
  immer((set) => ({
    msgRequests: {
      fromMe: [],
      fromOthers: [],
    },
    addToMyRequests: (newMsgRequest) =>
      set((prev) => {
        prev.msgRequests.fromMe.push(...newMsgRequest);
      }),
    addToOthersRequests: (newMsgRequest) =>
      set((prev) => {
        prev.msgRequests.fromOthers.push(...newMsgRequest);
      }),
    removeFromMyRequests: (userId) =>
      set((prev) => {
        prev.msgRequests.fromMe = prev.msgRequests.fromMe.filter(
          ({ to_id }) => to_id != userId
        );
      }),
    removeFromOthersRequests: (userId) =>
      set((prev) => {
        prev.msgRequests.fromOthers = prev.msgRequests.fromOthers.filter(
          ({ from_id }) => from_id != userId
        );
      }),
  }))
);
