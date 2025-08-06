import React from "react";
import styles from "../css/msg_replied_div.module.css";

const MsgRepliedDiv = ({ msg }) => {
  return (
    <>
      <div className={`${styles["msg-replied"]} d-flex align-items-end`}>
        <div
          className={`${styles["line"]} border border-bottom-0 border-end-0 rounded-start-3`}
        ></div>
        <div
          className={`${styles["msg-replied-content"]} d-flex align-items-center gap-2 w-100`}
        >
          <img
            src={msg.reply_to_msg_profile ?? "https://placehold.co/16"}
            className="rounded-circle"
            width={16}
            height={16}
            alt=""
          />
          <div className="text-muted fst-italic">{msg.reply_to_msg_sender}</div>
          <div className={`${styles["msg-replied-message"]}`}>
            {msg.reply_to_msg_message}
            {/* tabindex="-1" aria-hidden="true" style='min-height: 0px !important;
            max-height: none !important; height: 0px !important; visibility:
            hidden !important; overflow: hidden !important; position: absolute
            !important; z-index: -1000 !important; top: 0px !important; right:
            0px !important; display: block !important; border-width: 0px;
            box-sizing: border-box; font-family: system-ui, -apple-system,
            "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation
            Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol", "Noto Color Emoji"; font-size: 16px; font-style:
            normal; font-weight: 400; letter-spacing: normal; line-height: 24px;
            padding: 0px; tab-size: 8; text-indent: 0px; text-rendering: auto;
            text-transform: none; width: 741.688px; word-" */}
          </div>
        </div>
      </div>
    </>
  );
};

export default MsgRepliedDiv;
