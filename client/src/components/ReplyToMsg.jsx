import React from "react";
import { RxCross2 } from "react-icons/rx";
import { RxCrossCircled } from "react-icons/rx";
import styles from "../css/reply_to_msg.module.css";
import { useContext } from "react";
import { useOutletContext } from "react-router-dom";

const ReplyToMsg = ({ toWho }) => {
  const { setDmChat } = useOutletContext();
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
        onClick={() =>
          setDmChat((prev) => ({
            ...prev,
            msgToReply: null,
          }))
        }
      />
    </div>
  );
};

export default ReplyToMsg;
