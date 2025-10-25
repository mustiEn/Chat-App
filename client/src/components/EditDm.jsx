import React, { useCallback, useRef } from "react";
import { useEffect } from "react";
import Form from "react-bootstrap/Form";
import TextareaAutosize from "react-textarea-autosize";
import styles from "../css/dm_panel.module.css";
import { socket } from "../socket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Flex } from "@mantine/core";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const EditDm = ({ msg, editedMessage, setEditedMessage }) => {
  const { userId: receiverId } = useParams();
  const queryClient = useQueryClient();
  const editInpRef = useRef(null);

  const handleEdit = () => {
    const time = dayjs().format("YYYY-MM-DD HH:mm:ss");

    if (editInpRef.current != document.activeElement) {
      return;
    } else if (!editedMessage.message.trim()) {
      setEditedMessage({
        id: null,
        message: "",
      });
      return;
    } else if (msg.message == editedMessage.message) {
      return;
    }

    if (!socket.connected) {
      const { dms } = queryClient.getQueryData(["chatMessages", receiverId]);
      const mappedDms = dms.map((m) =>
        m.id == msg.id
          ? {
              ...m,
              message: editedMessage.message,
              isPending: true,
              is_edited: true,
            }
          : m
      );

      queryClient.setQueryData(["chatMessages", receiverId], (olderData) => ({
        ...olderData,
        dms: mappedDms,
      }));
    }

    setEditedMessage({
      id: null,
      message: "",
    });
    socket.emit(
      "send edited msgs",
      {
        id: editedMessage.id,
        toId: receiverId,
        message: editedMessage.message,
        updatedAt: time,
      },
      (err, res) => {
        if (err) {
          console.log("Edited Message failed:", err);
          return;
        }

        const { dms } = queryClient.getQueryData(["chatMessages", receiverId]);
        const mappedDms = dms.map((m) =>
          m.id == msg.id
            ? {
                ...m,
                message: editedMessage.message,
                isPending: false,
                is_edited: true,
              }
            : m
        );
        queryClient.setQueryData(["chatMessages", receiverId], (olderData) => ({
          ...olderData,
          dms: mappedDms,
        }));

        console.log("Edited Message successfull: ", res);
      }
    );
  };

  return (
    <>
      <Flex
        align={"center"}
        p={"sm"}
        gap={"sm"}
        className={`${styles["message-form"]} ${
          editedMessage.id != null
            ? editedMessage.id != msg.id
              ? "d-none"
              : ""
            : "d-none"
        } rounded-3 custom-scrollbar`}
      >
        <TextareaAutosize
          maxRows={20}
          ref={editInpRef}
          id={styles["edit-input"]}
          className={`border-0 bg-transparent text-white w-100`}
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
              handleEdit();
            } else if (e.key === "Escape") {
              setEditedMessage({
                id: null,
                message: "",
              });
            }
          }}
        />
      </Flex>
    </>
  );
};

export default EditDm;
