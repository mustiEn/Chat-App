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
import { usePendingMsgStore } from "../stores/usePendingMsgStore.js";
import { Box, Flex } from "@mantine/core";
import styles from "../css/panel.module.css";
import { addMessage } from "../utils/messages.js";
import toast from "react-hot-toast";

dayjs.extend(utc);
dayjs.extend(timezone);

const GroupMessageInput = () => {
  const queryClient = useQueryClient();
  const { groupId } = useParams();
  const { groupChatRef } = useOutletContext();
  const { msgAddedOrDeleted } = groupChatRef.current;

  const msgToReply = useMsgToReplyStore((s) => s.msgToReply);
  const setMsgToReply = useMsgToReplyStore((s) => s.setMsgToReply);
  const addPendingMsg = usePendingMsgStore((s) => s.addGroupPendingMsg);
  const removeFromPendingMsgs = usePendingMsgStore(
    (s) => s.removeFromGroupPendingMsgs
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

    if (pendingMsgs.group[groupId])
      removeFromPendingMsgs(groupId, res.result[0].clientOffset);

    addMessage("groupMessages", queryClient, groupId, res.result[0]);
    // socket.auth.serverOffset.dm[receiverId] = res.result[0].id;
    // directMessagesBottomId[receiverId] = res.result[0].id;
    msgAddedOrDeleted[groupId] = true;

    console.log("Message successful:", res);
  };
  const handleSocketEmit = (clientOffset) => {
    socket.emit(
      "send group msgs",
      {
        message: message,
        from_id: socket.auth.user.id,
        group_id: Number(groupId),
        clientOffset,
        reply_to_msg_id: msgToReply?.id ?? null,
      },
      groupId,
      (err, res) => handleEmitCallback(err, res, "dm")
    );
  };
  const handleSubmit = (msgPayload) => {
    if (!socket.connected) {
      addPendingMsg(groupId, { ...msgPayload, isPending: true });
      msgAddedOrDeleted[groupId] = true;
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
            <input type="file" hidden ref={fileInpRef} className="file-input" />
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
            placeholder={"Type a message..."}
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
                group_id: Number(groupId),
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
    </Box>
  );
};

export default GroupMessageInput;
