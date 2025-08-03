import React, { memo, useCallback } from "react";
import { LuDot } from "react-icons/lu";
import { socket } from "../socket.js";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { v4 as uuidv4 } from "uuid";
import Button from "react-bootstrap/esm/Button";
import { useMemo } from "react";
import DmList from "./DmList.jsx";
import DmContext from "../contexts/DmContext.jsx";
import styles from "../css/dm_panel.module.css";
import MessageInput from "./MessageInput.jsx";
import { useContext } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

const DmDisplay = ({ receiver }) => {
  const { userId: receiverId } = useParams();
  const [message, setMessage] = useState("");
  //* const value = useMemo(() => ({ chatData, setChatData }), [chatData]);
  const {
    chatData: {
      hasMoreUp,
      hasMoreDown,
      messages,
      isPinnedMsgsViewOpen,
      msgToReply,
    },
    setChatData,
    div,
  } = useContext(DmContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const fileInpRef = useRef(null);
  const textInpRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    const curr = messagesEndRef.current;
    // curr.scrollIntoView({
    //   behavior: "smooth",
    // });
  };
  const handleNewMessage = ({ msg, wasDisconnected }) => {
    if (wasDisconnected) {
      setChatData((prev) => {
        const pendingMessages =
          prev.pendingMessages.length > 0
            ? prev.pendingMessages.filter(
                (m) => m.clientOffset !== msg.clientOffset
              )
            : [];

        return {
          ...prev,
          authenticatedUserId: prev.authenticatedUserId,
          pendingMessages: pendingMessages,
          messages: [{ ...msg, isPending: false }, ...prev.messages],
        };
      });
    } else {
      setChatData((prev) => {
        return { ...prev, messages: [msg, ...prev.messages] };
      });
    }
    socket.auth.serverOffset = msg.id;
  };
  const handleEditedMessage = ({ result: editedMsgs }) => {
    setChatData((prev) => {
      const updatedMessagesMap = new Map(prev.messages.map((m) => [m.id, m]));

      editedMsgs.forEach(({ id, message }) => {
        const exists = updatedMessagesMap.has(id);

        if (exists) {
          let existingMsg = updatedMessagesMap.get(id);

          existingMsg = {
            ...existingMsg,
            message: message,
            isPending: false,
          };
          updatedMessagesMap.set(id, existingMsg);
        }
      });

      return {
        ...prev,
        messages: Array.from(updatedMessagesMap.values()),
      };
    });
  };
  const onConnect = () => {
    setIsConnected(true);
    socket.emit("join room", receiverId, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Joined room");
      }
    });
  };
  const handleSubmit = () => {
    const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const clientOffset = uuidv4();
    let wasDisconnected = false;

    if (textInpRef.current != document.activeElement) {
      return;
    } else if (!message.message.trim()) {
      return;
    }

    setMessage((prev) => ({
      ...prev,
      message: "",
    }));

    if (!socket.connected) {
      setChatData((prev) => ({
        ...prev,
        pendingMessages: [
          ...prev.pendingMessages,
          {
            message: message.message,
            createdAt: time,
            from_id: prev.authenticatedUserId,
            to_id: receiverId,
            clientOffset: clientOffset,
            isPending: true,
            reply_to_msg: msgToReply,
          },
        ],
      }));
      wasDisconnected = true;
    }

    socket.emit(
      "dms",
      {
        message: message.message,
        receiverId: receiverId,
        reply_to_msg: msgToReply,
        createdAt: time,
      },
      clientOffset,
      wasDisconnected,
      (err, res) => {
        if (err) {
          console.log("Message failed:", err);
          return;
        }
        console.log(res);
      }
    );
  };
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const top = scrollHeight + scrollTop;

      if (top == clientHeight && hasMoreUp) {
        console.log("set reached top true");
        setChatData((prev) => ({
          ...prev,
          reachedTop: true,
        }));
      }
    },
    [hasMoreDown, hasMoreUp]
  );

  useEffect(() => {
    onConnect();
    socket.on("dms", handleNewMessage);
    socket.on("edited msgs", handleEditedMessage);
    socket.auth.receiverId = receiverId;

    if (textInpRef.current) {
      textInpRef.current.focus();
    }

    if (messages.length) {
      scrollToBottom();
    }

    return () => {
      socket.off("dms", handleNewMessage);
      socket.off("edited msgs", handleEditedMessage);
      socket.emit("leave room", receiverId, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Left room");
        }
      });
    };
  }, []);

  useEffect(() => {
    const el = div?.current;

    if (!el) return;
    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [div?.current, div?.current, receiverId, handleScroll]);

  return (
    <>
      <div
        className={`d-flex flex-column-reverse text-white flex-shrink-1 overflow-y-auto custom-scrollbar position-relative w-100`}
        id={"scrollableref"}
        ref={div}
      >
        <DmList messagesEndRef={messagesEndRef} />
        <div
          className={`m-2 ${
            hasMoreUp ? "d-none" : isPinnedMsgsViewOpen ? "d-none" : ""
          }`}
        >
          <img
            src={
              receiver.profile ? receiver.profile : "https://placehold.co/80"
            }
            className="rounded-circle"
            alt=""
          />
          <div
            style={{
              fontSize: 24,
            }}
          >
            {receiver.display_name}
          </div>
          <div
            style={{
              fontSize: 20,
            }}
          >
            {receiver.username}
          </div>
          <div className="d-flex align-items-center gap-2">
            <div>No Mutual Groups</div>
            <LuDot />
            <Button variant="primary" size="sm">
              Add Friend
            </Button>
            <Button variant="light" size="sm">
              Block
            </Button>
          </div>
        </div>
      </div>

      <MessageInput
        fileInpRef={fileInpRef}
        textInpRef={textInpRef}
        scrollToBottom={scrollToBottom}
        handleSubmit={handleSubmit}
        message={message}
        setMessage={setMessage}
      />
    </>
  );
};

export default DmDisplay;
