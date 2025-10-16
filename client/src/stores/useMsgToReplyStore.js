import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useMsgToReplyStore = create(
  immer((set) => ({
    msgToReply: null,
    setMsgToReply: (msg) =>
      set({
        msgToReply: msg,
      }),
  }))
);
