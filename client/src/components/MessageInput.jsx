import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { GoPlusCircle } from "react-icons/go";
import { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import styles from "../css/dm_panel.module.css";
import ReplyToMsg from "./ReplyToMsg.jsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { v4 as uuidv4 } from "uuid";
import { useOutletContext, useParams } from "react-router-dom";
import { socket } from "../socket.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const MessageInput = () => {
  const { userId: receiverId } = useParams();
  const {
    dmChat: { msgToReply },
    setDmChat,
    scrollElementRef,
  } = useOutletContext();
  const [message, setMessage] = useState("");

  const fileInpRef = useRef(null);
  const textInpRef = useRef(null);

  const handleSubmit = () => {
    const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const clientOffset = uuidv4();
    let isDisconnected = false;

    if (textInpRef.current != document.activeElement) {
      return;
    } else if (!message.message.trim()) {
      return;
    }
    console.log("handle submit running");
    console.log("ClientOffset", clientOffset);

    if (!socket.connected) {
      console.log("socket not connected and set dmchat pending msgs");
      setDmChat((prev) => ({
        ...prev,
        pendingMessages: {
          ...prev.pendingMessages,
          [receiverId]: [
            ...prev.pendingMessages[receiverId],
            {
              display_name: receiverId == 2 ? "ali" : "veli", //^ initial datadan kim auth user bak
              message: message.message,
              from_id: prev.authenticatedUserId,
              to_id: receiverId,
              clientOffset: clientOffset,
              createdAt: time,
              isPending: true,
              reply_to_msg_message: msgToReply ? msgToReply.message : null,
              reply_to_msg_sender: msgToReply ? msgToReply.display_name : null,
              reply_to_msg_profile: msgToReply ? msgToReply.profile : null,
            },
          ],
        },
      }));
      isDisconnected = true;
    }

    socket.emit(
      "send dms",
      {
        message: message.message,
        receiverId,
        reply_to_msg: msgToReply ? msgToReply.id : null,
        createdAt: time,
      },
      clientOffset,
      isDisconnected,
      (err, res) => {
        if (err) {
          console.log("Message failed:", err);
          return;
        }

        console.log("Message successful:", res);
      }
    );
    setMessage((prev) => ({
      ...prev,
      message: "",
    }));
    setDmChat((prev) => ({
      ...prev,
      msgToReply: null,
    }));
  };

  useEffect(() => {
    if (textInpRef.current) {
      textInpRef.current.focus();
    }
  }, []);

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
            // onHeightChange={scrollToBottom}
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
              e.preventDefault();
              handleSubmit();
            }}
          />
        </div>
      </Form>
    </div>
  );
};

export default MessageInput;
