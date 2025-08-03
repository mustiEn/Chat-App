import React from "react";
import { RxCross2 } from "react-icons/rx";
import styles from "../css/reply_to_msg.module.css";
import { useContext } from "react";
import DmContext from "../contexts/DmContext";

const ReplyToMsg = () => {
  const { setChatData } = useContext(DmContext);
  return (
    <div
      id={`${styles["replyToMsg"]}`}
      className="d-flex justify-content-between align-items-center w-100 mt-2 ps-2 pt-1 rounded-top-3 border border-secondary border-opacity-50 border-bottom-0"
    >
      <div className="text-white">
        Replying to <span className="fw-bold">Manifestci</span>
      </div>
      <RxCross2
        className={`${styles["icon"]} text-black`}
        onClick={() =>
          setChatData((prev) => ({
            ...prev,
            msgToReply: null,
          }))
        }
      />
    </div>
  );
};

export default ReplyToMsg;
