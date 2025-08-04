import React from "react";
import styles from "../css/msg_replied_div.module.css";

const MsgRepliedDiv = ({ msg }) => {
  return (
    <>
      <div className={`${styles["msg-replied"]} d-flex align-items-end`}>
        <div
          className={`${styles["line"]} border border-bottom-0 border-end-0 rounded-start-3`}
        ></div>
        <div className={`${styles["msg-replied-content"]} d-flex gap-2`}>
          <img
            src={msg.reply_to_msg_profile ?? "https://placehold.co/16"}
            className="align-self-baseline rounded-circle"
            width={16}
            height={16}
            alt=""
          />
          <div>{msg.reply_to_msg_sender}</div>
          <div>{msg.reply_to_msg_message}</div>
        </div>
      </div>
    </>
  );
};

export default MsgRepliedDiv;
