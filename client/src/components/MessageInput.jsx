import React, { useCallback, useEffect, useState } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

dayjs.extend(utc);
dayjs.extend(timezone);

const MessageInput = () => {
  const queryClient = useQueryClient();
  const { userId: receiverId } = useParams();
  const {
    dmChat: { msgToReply, receivers, pendingMessages },
    setDmChat,
    setDmHistoryUsers,
    msgRequests,
    setMsgRequests,
  } = useOutletContext();
  const [message, setMessage] = useState("");
  const fileInpRef = useRef(null);
  const textInpRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const handleSocketEmit = (time, clientOffset) => {
      console.log("handleSocketEmit func running");
      const { dms } = queryClient.getQueryData(["initialChatData", receiverId]);
      const emitData = {
        message: message,
        from_id: socket.auth.user.id,
        to_id: Number(receiverId),
        clientOffset,
        reply_to_msg: msgToReply ?? null,
        createdAt: time,
      };
      const handleEmitCallback = (err, res, key) => {
        if (err || res.status === "duplicated" || res.status === "error") {
          console.log("Message failed:", err, res.error);
          return;
        }
        console.log(dayjs().second());

        if (key == "acceptance") {
          setMsgRequests((prev) => {
            const { [receiverId]: _, ...rest } = prev.fromOthers;
            return { ...prev, fromOthers: rest };
          });
        } else if (key == "request") {
          setMsgRequests((prev) => ({
            ...prev,
            fromMe: { ...prev.fromMe, [receiverId]: res.payload },
          }));
          setDmHistoryUsers((prev) => [receivers[receiverId], ...prev]);
        }

        setDmChat((prev) => {
          console.log("prev:", prev.pendingMessages, res.payload[0].to_id);

          if (!prev.pendingMessages[res.payload[0].to_id]) return prev;

          console.log("it exists");

          const newPendingMessages = prev.pendingMessages[
            res.payload[0].to_id
          ].filter((m) => m.clientOffset !== res.payload[0].clientOffset);

          return {
            ...prev,
            pendingMessages: {
              ...prev.pendingMessages,
              [res.payload[0].to_id]: newPendingMessages,
            },
          };
        });

        queryClient.setQueryData(
          ["initialChatData", receiverId],
          (olderData) => ({
            ...olderData,
            dms: [...olderData.dms, res.payload[0]],
          })
        );
        socket.auth.serverOffset[receiverId] = res.payload[0].id;

        console.log("Message successful:", res);
      };

      if (msgRequests.fromOthers[receiverId]) {
        console.log("acceptance if");

        const acceptance = {
          reqMsg: msgRequests.fromOthers[receiverId],
          status: "accepted",
        };

        socket.emit(
          "send msg request acceptance",
          emitData,
          acceptance,
          (err, res) => handleEmitCallback(err, res, "acceptance")
        );
      } else if (!dms.length && receivers[receiverId].with_in_no_contact) {
        console.log("not in contact if");

        socket.emit("send msg requests", emitData, (err, res) =>
          handleEmitCallback(err, res, "request")
        );
      } else {
        console.log("dms if");

        socket.emit("send dms", emitData, (err, res) =>
          handleEmitCallback(err, res, "dm")
        );
      }
    };
    const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const clientOffset = uuidv4();
    const msgPayload = {
      display_name: socket.auth.user.display_name,
      message: message,
      from_id: socket.auth.user.id,
      to_id: Number(receiverId),
      clientOffset,
      created_at: time,
      reply_to_msg_message: msgToReply?.message ?? null,
      reply_to_msg_sender: msgToReply?.display_name ?? null,
      reply_to_msg_profile: msgToReply?.profile ?? null,
    };

    if (textInpRef.current != document.activeElement) {
      return;
    } else if (!message.trim()) {
      return;
    }

    if (!socket.connected) {
      console.log("socket not connected and set dmchat pending msgs");
      setDmChat((prev) => ({
        ...prev,
        pendingMessages: {
          ...prev.pendingMessages,
          [receiverId]: [
            ...(prev.pendingMessages[receiverId] ?? []),
            { ...msgPayload, isPending: true },
          ],
        },
      }));
    }

    setMessage("");
    handleSocketEmit(time, clientOffset, msgPayload);

    if (msgToReply) {
      setDmChat((prev) => ({
        ...prev,
        msgToReply: null,
      }));
    }
  }, [msgToReply, message, receiverId, pendingMessages]);

  useEffect(() => {
    if (textInpRef.current) {
      textInpRef.current.focus();
    }
  }, []);

  return (
    <div className="w-100 px-2 mt-auto mb-4">
      {receivers[receiverId]?.is_blocked ? (
        <div>You blocked this user</div>
      ) : msgRequests.fromMe[receiverId] ? (
        <h4>Your msg been sent waiting for acceptance</h4>
      ) : (
        <>
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
                placeholder={`${
                  msgRequests.fromOthers[receiverId]
                    ? "Any message will be considered as acceptance"
                    : "Type a message..."
                }`}
                value={message}
                style={{
                  whiteSpace: "pre-wrap",
                }}
                // onHeightChange={scrollToBottom}
                onChange={(e) => {
                  setMessage((prev) =>
                    e.nativeEvent.inputType === "insertLineBreak"
                      ? prev
                      : e.target.value
                  );
                }}
                onKeyUp={(e) => {
                  if (e.key != "Enter") return;
                  e.preventDefault();
                  handleSubmit();
                }}
              />
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default MessageInput;
