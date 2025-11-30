import React, { useCallback, useContext, useEffect, useState } from "react";
import { GoPlusCircle } from "react-icons/go";
import { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import ReplyToMsg from "./ReplyToMsg.jsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { v4 as uuidv4 } from "uuid";
import { useOutletContext, useParams } from "react-router-dom";
import { socket } from "../socket.js";
import { useQueryClient } from "@tanstack/react-query";
import { useMsgToReplyStore } from "../stores/useMsgToReplyStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { usePendingMsgStore } from "../stores/usePendingMsgStore.js";
import { Box, Flex } from "@mantine/core";
import styles from "../css/dm_panel.module.css";
import { addMessage } from "../utils/chatMessages.js";
import { addDmHistoryUsers } from "../utils/dmHistoryUsers.js";
import { useMessageRequests } from "../custom-hooks/useMessageRequests.js";
import {
  addSentMessageRequests,
  removeReceivedMessageRequest,
} from "../utils/msgRequests.js";
import toast from "react-hot-toast";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";

dayjs.extend(utc);
dayjs.extend(timezone);

const MessageInput = () => {
  const queryClient = useQueryClient();
  const { chatId } = useParams();
  const { receiverId } = useContext(DmPanelContext);
  const { dmChatRef } = useOutletContext();
  const { msgAddedOrDeleted } = dmChatRef.current;
  const { data } = useMessageRequests();
  const { receivedMessageRequests = [], sentMessageRequests = [] } = data ?? [];

  const msgToReply = useMsgToReplyStore((s) => s.msgToReply);
  const setMsgToReply = useMsgToReplyStore((s) => s.setMsgToReply);
  const receivers = useReceiverStore((s) => s.receivers);
  const receiver = receivers[receiverId];
  const addToPendingMsgs = usePendingMsgStore((s) => s.addToPendingMsgs);
  const removeFromPendingMsgs = usePendingMsgStore(
    (s) => s.removeFromPendingMsgs
  );
  const [message, setMessage] = useState("");
  const fileInpRef = useRef(null);
  const textInpRef = useRef(null);

  const handleEmitCallback = (err, res, key) => {
    const { pendingMsgs } = usePendingMsgStore.getState();

    if (res.status === "duplicated") return;
    if (err || res.status === "error") {
      console.log("Message failed:", err, res.error);
      toast.error(res.error);

      return;
    }
    console.log(res);

    if (key == "acceptance") {
      removeReceivedMessageRequest(queryClient, receiverId);
    } else if (key == "request") {
      const dmHistoryUsers = queryClient.getQueryData(["dmHistory"]) ?? [];
      console.log(dmHistoryUsers);

      const isUserInDmHistory = dmHistoryUsers.some(
        ({ id }) => id == receiverId
      );
      addSentMessageRequests(queryClient, res.result);

      if (!isUserInDmHistory && dmHistoryUsers.length)
        addDmHistoryUsers(queryClient, [receiver]);
    }

    if (pendingMsgs[chatId])
      removeFromPendingMsgs(chatId, res.result[0].clientOffset);

    addMessage(queryClient, chatId, res.result[0]);
    // socket.auth.serverOffset[receiverId] = res.result[0].id;
    // chatMessagesBottomId[receiverId] = res.result[0].id;
    msgAddedOrDeleted[chatId] = true;

    console.log("Message successful:", res);
  };
  const handleSocketEmit = (clientOffset) => {
    const data = queryClient.getQueryData(["chatMessages", chatId]);
    const messages = data.pages.flatMap(({ messages }) => messages);
    const emitData = {
      message: message,
      from_id: socket.auth.user.id,
      to_id: Number(receiverId),
      clientOffset,
      reply_to_msg: msgToReply?.id ?? null,
    };

    const msgReqReceived = receivedMessageRequests.find(
      ({ from_id }) => from_id == receiverId
    );
    if (msgReqReceived) {
      const acceptance = {
        msgReq: msgReqReceived,
        status: "accepted",
      };

      socket.emit(
        "send msg request acceptance",
        emitData,
        acceptance,
        (err, res) => handleEmitCallback(err, res, "acceptance")
      );
    } else if (!messages.length && receiver.with_in_no_contact) {
      socket.emit("send msg requests", emitData, (err, res) =>
        handleEmitCallback(err, res, "request")
      );
    } else {
      socket.emit("send dms", emitData, chatId, (err, res) =>
        handleEmitCallback(err, res, "dm")
      );
    }
  };
  const handleSubmit = (msgPayload) => {
    if (!socket.connected) {
      addToPendingMsgs(chatId, { ...msgPayload, isPending: true });
      msgAddedOrDeleted[chatId] = true;
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
    <Box w={"100%"} px={"xs"} mt={"auto"} mb={"sm"}>
      {receiver?.isBlocked ? (
        receiver.blockedBy === "receiver" ? (
          <div>You've been blocked</div>
        ) : (
          <div>You blocked this user</div>
        )
      ) : sentMessageRequests.some(({ to_id }) => to_id == receiverId) ? (
        <h4>Your msg been sent waiting for acceptance</h4>
      ) : (
        <>
          {msgToReply && <ReplyToMsg toWho={msgToReply?.display_name} />}
          <Flex
            p={"xs"}
            align={"center"}
            className={`${styles["message-form"]} ${
              msgToReply && "msg-to-reply-active"
            } custom-scrollbar`}
          >
            <Flex w={"100%"} gap={"xs"}>
              <Flex
                justify={"center"}
                align={"center"}
                style={{
                  width: 30,
                  height: 30,
                }}
              >
                <input
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
              </Flex>
              <TextareaAutosize
                autoFocus
                ref={textInpRef}
                maxRows={40}
                id={styles["msg-input"]}
                className="border-0 bg-transparent msg-input text-white w-100"
                placeholder={`${
                  receivedMessageRequests.find(
                    ({ from_id }) => from_id == receiverId
                  )
                    ? "Any message will be considered as acceptance"
                    : "Type a message..."
                }`}
                value={message}
                style={{
                  whiteSpace: "pre-wrap",
                  maxBlockSize: 350,
                  border: "0",
                  backgroundColor: "transparent",
                  color: "white",
                  width: "100%",
                }}
                // onHeightChange={}
                onChange={(e) => {
                  setMessage((prev) =>
                    e.nativeEvent.inputType === "insertLineBreak"
                      ? prev
                      : e.target.value
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key != "Enter") {
                    return;
                  } else if (textInpRef.current != document.activeElement) {
                    return;
                  } else if (!message.trim()) {
                    return;
                  }
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
                    replied_msg_message: msgToReply?.message ?? null,
                    replied_msg_sender: msgToReply?.display_name ?? null,
                    replied_msg_profile: msgToReply?.profile ?? null,
                  };

                  handleSubmit(msgPayload);
                  handleSocketEmit(clientOffset);
                }}
              />
            </Flex>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default MessageInput;
