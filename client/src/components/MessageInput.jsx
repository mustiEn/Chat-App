import React from "react";
import Form from "react-bootstrap/Form";
import { GoPlusCircle } from "react-icons/go";
import { useRef } from "react";
import { socket } from "../socket.js";
import { useContext } from "react";
import DmContext from "../contexts/DmContext.jsx";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCallback } from "react";
import TextareaAutosize from "react-textarea-autosize";
import styles from "../css/dm_panel.module.css";
import ReplyToMsg from "./ReplyToMsg.jsx";

const MessageInput = ({
  fileInpRef,
  textInpRef,
  message,
  setMessage,
  scrollToBottom,
  handleSubmit,
  handleReplyToMsg,
}) => {
  const {
    chatData: { msgToReply },
    setChatData,
  } = useContext(DmContext);

  useEffect(() => console.log(msgToReply), [msgToReply]);

  return (
    <div className="w-100 px-2 mt-auto mb-4">
      {msgToReply && <ReplyToMsg toWho={msgToReply?.display_name} />}
      <Form
        className={`${styles["message-form"]} ${
          msgToReply && "rounded-top-0"
        } rounded-3 p-3 custom-scrollbar border border-secondary border-opacity-50`}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center align-self-baseline text-white"
            style={{
              width: 30,
              height: 30,
            }}
          >
            <Form.Control
              type="file"
              hidden
              ref={fileInpRef}
              className="file-input"
            />
            <GoPlusCircle
              id={styles["fileIcon"]}
              className="fs-5"
              onClick={() => fileInpRef.current.click()}
            />
          </div>
          <TextareaAutosize
            autoFocus
            ref={textInpRef}
            maxRows={20}
            id={styles["msg-input"]}
            className="border-0 bg-transparent msg-input text-white w-100"
            placeholder="Type a message..."
            value={message.message}
            style={{
              whiteSpace: "pre-wrap",
            }}
            onHeightChange={scrollToBottom}
            onChange={(e) => {
              setMessage((prev) => ({
                ...prev,
                message:
                  e.nativeEvent.inputType === "insertLineBreak"
                    ? prev.message
                    : e.target.value,
              }));
            }}
            onKeyUp={(e) => {
              if (e.key != "Enter") return;
              handleSubmit();
            }}
          />
        </div>
      </Form>
    </div>
  );
};

export default MessageInput;
