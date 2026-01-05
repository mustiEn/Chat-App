import React from "react";
import EditMsg from "./EditMsg.jsx";
import { formatDate, isURL, normaliseURL } from "../utils/index.js";
import MsgRepliedDiv from "./MsgRepliedDiv.jsx";
import { Anchor } from "@mantine/core";

const MsgItemInner = ({ msg = [], editedMessage, setEditedMessage }) => {
  return (
    <>
      {msg.replied_msg_sender && <MsgRepliedDiv msg={msg} />}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          width: "100%",
        }}
      >
        <img
          src={msg.profile ?? "https://placehold.co/40"}
          style={{
            alignSelf: "baseline",
            // border: "1px solid white",
            borderRadius: "100%",
            width: 40,
            height: 40,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <div
              style={{
                fontWeight: "bold",
              }}
            >
              {msg.display_name}
            </div>
            <span className={`timestamp text-muted`}>
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
          <EditMsg
            msg={msg}
            editedMessage={editedMessage}
            setEditedMessage={setEditedMessage}
          />
          {isURL(msg?.message ?? "") ? (
            <Anchor
              className={`message-content`}
              style={{
                display: editedMessage.id ? "none" : "block",
              }}
              href={normaliseURL(msg.message)}
              target="_blank"
            >
              {normaliseURL(msg.message)}
            </Anchor>
          ) : (
            <div
              className={`message-content`}
              style={{
                display: editedMessage.id ? "none" : "block",
              }}
            >
              {msg.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MsgItemInner;
