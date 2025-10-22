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
import { useParams } from "react-router-dom";
import { socket } from "../socket.js";
import { useQueryClient } from "@tanstack/react-query";
import { useMsgRequestStore } from "../stores/useMsgRequestStore.js";
import { useShallow } from "zustand/shallow";
import { useDmHistoryUserStore } from "../stores/useDmHistoryUserStore.js";
import { useMsgToReplyStore } from "../stores/useMsgToReplyStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { usePendingMsgStore } from "../stores/usePendingMsgStore.js";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const MessageInput = () => {
  const queryClient = useQueryClient();
  const { userId: receiverId } = useParams();
  const msgRequests = useMsgRequestStore((state) => state.msgRequests);
  const addToMyRequests = useMsgRequestStore((state) => state.addToMyRequests);
  const removeFromOthersRequests = useMsgRequestStore(
    (state) => state.removeFromOthersRequests
  );
  const addToDmHistoryUsers = useDmHistoryUserStore(
    (state) => state.addToDmHistoryUsers
  );
  const msgToReply = useMsgToReplyStore((state) => state.msgToReply);
  const setMsgToReply = useMsgToReplyStore((state) => state.setMsgToReply);
  const receivers = useReceiverStore((state) => state.receivers);
  const addToPendingMsgs = usePendingMsgStore(
    (state) => state.addToPendingMsgs
  );
  const removeFromPendingMsgs = usePendingMsgStore(
    (state) => state.removeFromPendingMsgs
  );
  const [message, setMessage] = useState("");
  const fileInpRef = useRef(null);
  const textInpRef = useRef(null);
  const handleEmitCallback = (err, res, key) => {
    const { pendingMsgs } = usePendingMsgStore.getState();

    if (res.status === "duplicated") return;
    if (err || res.status === "error") {
      console.log("Message failed:", err, res.error);
      return;
    }

    if (key == "acceptance") {
      removeFromOthersRequests(receiverId);
    } else if (key == "request") {
      const isUserInDmHistory = useDmHistoryUserStore
        .getState()
        .dmHistoryUsers.some(({ id }) => id == receiverId);
      addToMyRequests(res.result);

      if (!isUserInDmHistory) addToDmHistoryUsers([receivers[receiverId]]);
    }

    if (pendingMsgs[res.result[0].to_id])
      removeFromPendingMsgs(receiverId, res.result[0].clientOffset);

    queryClient.setQueryData(["chatMessages", receiverId], (olderData) => ({
      ...olderData,
      dms: [...olderData.dms, res.result[0]],
    }));
    socket.auth.serverOffset[receiverId] = res.result[0].id;

    console.log("Message successful:", res);
  };
  const handleSocketEmit = (time, clientOffset) => {
    console.log(msgRequests.fromOthers);

    const { dms } = queryClient.getQueryData(["chatMessages", receiverId]);
    const emitData = {
      message: message,
      from_id: socket.auth.user.id,
      to_id: Number(receiverId),
      clientOffset,
      reply_to_msg: msgToReply ?? null,
      createdAt: time,
    };

    if (msgRequests.fromOthers.some(({ from_id }) => from_id == receiverId)) {
      console.log("acceptance if");

      const acceptance = {
        reqMsg: msgRequests.fromOthers.find(
          ({ from_id }) => from_id == receiverId
        ),
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
  const handleSubmit = (msgPayload) => {
    if (textInpRef.current != document.activeElement) {
      return;
    } else if (!message.trim()) {
      return;
    }

    if (!socket.connected) {
      console.log("socket not connected and set dmchat pending msgs");
      addToPendingMsgs(receiverId, { ...msgPayload, isPending: true });
    }

    setMessage("");

    if (msgToReply) setMsgToReply(null);
  };

  useEffect(() => {
    if (textInpRef.current) {
      textInpRef.current.focus();
    }
  }, []);

  return (
    <div className="w-100 px-2 mt-auto mb-4">
      {receivers[receiverId]?.is_blocked ? (
        <div>You blocked this user</div>
      ) : msgRequests.fromMe.some(({ to_id }) => to_id == receiverId) ? (
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
                  msgRequests.fromOthers.find(
                    ({ from_id }) => from_id == receiverId
                  )
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
                  handleSubmit(msgPayload);
                  handleSocketEmit(time, clientOffset, msgPayload);
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
