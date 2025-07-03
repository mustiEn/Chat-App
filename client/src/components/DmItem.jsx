import React from "react";
import { PiPencilSimple, PiArrowBendUpLeft } from "react-icons/pi";
import { ImBin } from "react-icons/im";
import { RxDrawingPin } from "react-icons/rx";
import { useCallback } from "react";
import Options from "./Options.jsx";
import EditDm from "./EditDm.jsx";
import { useState } from "react";
import { useRef } from "react";
import { socket } from "../socket.js";
import DmContext from "../contexts/DmContext.jsx";
import { useContext } from "react";
import { memo } from "react";
import { formatDate } from "../utils/index.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const DmItem = memo(function DmItem({ msg, styles, msgListRef }) {
  const editInpRef = useRef(null);
  const { chatData, setChatData } = useContext(DmContext);
  const [editedMessage, setEditedMessage] = useState({ id: null, message: "" });

  const makeMsgEditable = (msg) => {
    const ref = msgListRef.current;
    setEditedMessage({
      id: msg.id,
      message: msg.message,
    });
    setTimeout(() => {
      ref.querySelector(`#message-${msg.id} textarea`).focus();
      console.log("focus");
    }, 100);
  };
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
      setChatData((prev) => {
        const messages = prev.messages.map((m) =>
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
          messages: messages,
        };
      });
    }

    socket.emit(
      "Edited msg",
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
        console.log(chatData);
      }
    );
  };
  const options = useCallback(
    () => [
      {
        name: "Edit",
        icon: <PiPencilSimple />,
        func: makeMsgEditable,
      },
      {
        name: "Reply",
        icon: <PiArrowBendUpLeft />,
        func: () => console.log("hey"),
      },
      { name: "Delete", icon: <ImBin />, func: () => console.log("hey") },
      { name: "Pin", icon: <RxDrawingPin />, func: () => console.log("hey") },
    ],
    []
  );
  return (
    <>
      <li
        id={`message-${msg.id}`}
        className={`${styles["message"]} position-relative d-flex align-items-center p-1 gap-2 w-100`}
      >
        <img
          src={msg.profile ?? "https://placehold.co/40"}
          className="align-self-baseline rounded-circle"
          width={40}
          height={40}
          alt=""
        />
        <div className="d-flex flex-column w-100">
          <div className="d-flex align-items-center gap-2">
            <div className="fw-bold text-white">{msg.display_name}</div>
            <span className={`${styles["timestamp"]} text-muted`}>
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
          <EditDm
            msg={msg}
            styles={styles}
            editedMessage={editedMessage}
            setEditedMessage={setEditedMessage}
            handleEdit={handleEdit}
            editInpRef={editInpRef}
          />
          <div
            className={`${styles["message-content"]} ${
              editedMessage.id ? "d-none" : ""
            } text-white`}
          >
            {msg.message}
          </div>
        </div>
        <div
          className={`${styles["options-tab"]} position-absolute align-items-center bg-dark border border-dark rounded-3 translate-middle-y end-0 top-0 me-3`}
        >
          <Options options={options} msg={msg} styles={styles} />
        </div>
      </li>
    </>
  );
});

export default DmItem;
