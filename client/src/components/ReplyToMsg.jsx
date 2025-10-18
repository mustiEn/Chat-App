import React from "react";
import { RxCrossCircled } from "react-icons/rx";
import styles from "../css/reply_to_msg.module.css";
import { useMsgToReplyStore } from "../stores/useMsgToReplyStore";

const ReplyToMsg = ({ toWho }) => {
  const setMsgToReply = useMsgToReplyStore((state) => state.setMsgToReply);
  return (
    <div
      id={`${styles["replyToMsg"]}`}
      className="d-flex justify-content-between align-items-center w-100 mt-2 px-2 rounded-top-3 border border-secondary border-opacity-50 border-bottom-0"
    >
      <div className="text-white">
        Replying to <span className="fw-bold">{toWho}</span>
      </div>
      <RxCrossCircled
        className={`${styles["icon"]}`}
        onClick={() => setMsgToReply(null)}
      />
    </div>
  );
};

export default ReplyToMsg;
