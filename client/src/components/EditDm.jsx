import React, { useRef } from "react";
import { useEffect } from "react";
import Form from "react-bootstrap/Form";
import TextareaAutosize from "react-textarea-autosize";
import styles from "../css/dm_panel.module.css";
import { socket } from "../socket";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const EditDm = ({ msg, editedMessage, setEditedMessage }) => {
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
    }

    setEditedMessage({
      id: null,
      message: "",
    });

    if (!socket.connected) {
      setDmChat((prev) => {
        const messages = prev.messages[receiverId].map((m) =>
          m.id == msg.id
            ? {
                ...m,
                message: editedMessage.message,
                isPending: true,
                is_edited: true,
              }
            : m
        );

        return {
          ...prev,
          messages: { ...prev.messages, [receiverId]: messages },
        };
      });
    }

    socket.emit(
      "send edited msgs",
      {
        id: editedMessage.id,
        message: editedMessage.message,
        updatedAt: time,
      },
      (err, res) => {
        if (err) {
          console.log("Edited Message failed:", err);
          return;
        }
        console.log(res);
      }
    );
  };

  return (
    <>
      <Form
        className={`d-flex align-items-center ${styles["message-form"]} ${
          editedMessage.id != null
            ? editedMessage.id != msg.id
              ? "d-none"
              : ""
            : "d-none"
        } rounded-3 p-3 gap-3 custom-scrollbar`}
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
              handleEdit(msg.id);
            } else if (e.key === "Escape") {
              setEditedMessage({
                id: null,
                message: "",
              });
            }
          }}
        />
      </Form>
    </>
  );
};

export default EditDm;
