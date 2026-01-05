import React, { useCallback, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import styles from "../css/panel.module.css";
import { socket } from "../socket.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { Flex } from "@mantine/core";
import { editMessage } from "../utils/messages.js";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const EditMsg = ({ msg, editedMessage, setEditedMessage }) => {
  const { pathname } = useLocation();
  const params = useParams();
  const pathnameHasGroupId = pathname.includes("/@me/gc/");
  const paramId = pathnameHasGroupId ? params.groupId : params.chatId;
  const queryKey = pathnameHasGroupId ? "groupMessages" : "directMessages";
  const socketEndpoint = pathnameHasGroupId
    ? "send group edited msgs"
    : "send dm edited msgs";
  const queryClient = useQueryClient();
  const editInpRef = useRef(null);

  const handleEdit = (paramId) => {
    const time = dayjs().format("YYYY-MM-DD HH:mm:ss");

    if (editInpRef.current != document.activeElement) {
      return;
    } else if (!editedMessage.message.trim()) {
      setEditedMessage({
        id: null,
        message: "",
      });
      return;
    } else if (msg.message == editedMessage.message) return;

    if (!socket.connected) {
      editMessage(
        queryKey,
        queryClient,
        paramId,
        msg.id,
        editedMessage.message,
        true
      );
    }

    setEditedMessage({
      id: null,
      message: "",
    });

    socket.emit(
      socketEndpoint,
      {
        id: editedMessage.id,
        message: editedMessage.message,
        updatedAt: time,
      },
      paramId,
      (err, res) => {
        if (err) {
          console.log("Edited Message failed:", err);
          return;
        }

        editMessage(
          queryKey,
          queryClient,
          paramId,
          msg.id,
          editedMessage.message,
          false
        );

        console.log("Edited Message successfull: ", res);
      }
    );
  };

  return (
    <>
      {editedMessage?.id === msg.id && (
        <Flex
          align={"center"}
          p={"sm"}
          gap={"sm"}
          bdrs={"lg"}
          className={`${styles["message-form"]} custom-scrollbar`}
        >
          <TextareaAutosize
            maxRows={20}
            ref={editInpRef}
            id={styles["edit-input"]}
            style={{
              border: "0",
              background: "transparent",
              color: "white",
              width: "100%",
            }}
            value={editedMessage.message}
            onChange={(e) => {
              setEditedMessage((prev) => ({
                ...prev,
                message: e.target.value,
              }));
            }}
            // onHeightChange={scrollbottom}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEdit(paramId);
              } else if (e.key === "Escape") {
                setEditedMessage({
                  id: null,
                  message: "",
                });
              }
            }}
          />
        </Flex>
      )}
    </>
  );
};

export default EditMsg;
