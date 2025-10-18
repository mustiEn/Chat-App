import React from "react";
import EditDm from "./EditDm";
import { formatDate } from "../utils";
import styles from "../css/dm_panel.module.css";
import MsgRepliedDiv from "../components/MsgRepliedDiv";
import { useEffect } from "react";

const DmItemInner = ({ msg = [], editedMessage, setEditedMessage }) => {
  // useEffect(() => {
  //   console.log("msg in inner: ", msg);
  // }, [msg]);
  return (
    <>
      {msg.reply_to_msg_sender && <MsgRepliedDiv msg={msg} />}
      <div className={`${styles["aa"]} d-flex align-items-center gap-2 w-100 `}>
        <img
          src={msg.profile ?? "https://placehold.co/40"}
          className="align-self-baseline rounded-circle"
          width={40}
          height={40}
          alt=""
        />
        <div className="d-flex flex-column w-100">
          <div className="d-flex align-items-center gap-2">
            <div className="fw-bold text-white">{msg.display_name}</div>
            <span className={`${styles["timestamp"]} text-muted`}>
              {formatDate(msg.created_at)}
              {msg?.is_edited
                ? msg.isPending
                  ? "editing now!"
                  : "edited"
                : msg?.isPending
                ? "sending"
                : "Sent!"}
            </span>
          </div>
          <EditDm
            msg={msg}
            editedMessage={editedMessage}
            setEditedMessage={setEditedMessage}
          />
          <div
            className={`${styles["message-content"]} ${
              editedMessage.id ? "d-none" : ""
            } text-white`}
          >
            {msg.message}
          </div>
        </div>
      </div>
    </>
  );
};

export default DmItemInner;
