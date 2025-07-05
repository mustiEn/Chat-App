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
import MessageInput from "./MessageInput.jsx";
import { useContext } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

const DmDisplay = ({ dmData, styles }) => {
  const { receiver } = dmData;
  const { userId: receiverId } = useParams();
  const [message, setMessage] = useState("");
  //* const value = useMemo(() => ({ chatData, setChatData }), [chatData]);
  const {
    chatData: { hasMoreUp, direction },
    setChatData,
  } = useContext(DmContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const fileInpRef = useRef(null);
  const textInpRef = useRef(null);
  const messagesEndRef = useRef(null);
  const div = useRef();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          authenticatedUserId: prev.authenticatedUserId,
          pendingMessages: pendingMessages,
          messages: [{ ...msg, isPending: false }, ...prev.messages],
        };
      });
    } else {
      setChatData((prev) => ({
        ...prev,
        messages: [msg, ...prev.messages],
      }));
    }
    console.log("new msg", msg);

    socket.auth.serverOffset = msg.id;
  };
  const handleEditedMessage = ({ msg }) => {
    setChatData((prev) => {
      const messages = prev.messages.map((m) => {
        return m.id == msg.id
          ? { ...m, message: msg.message, is_edited: true, isPending: false }
          : m;
      });
      return {
        ...prev,
        messages: messages,
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
          },
        ],
      }));
      wasDisconnected = true;
    }

    socket.emit(
      "dm",
      {
        message: message.message,
        receiverId: receiverId,
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
  useEffect(() => {
    onConnect();
    socket.on("dm", handleNewMessage);
    socket.on("Edited msg", handleEditedMessage);
    socket.auth.receiverId = receiverId;

    if (textInpRef.current) {
      textInpRef.current.focus();
    }

    return () => {
      socket.off("dm", handleNewMessage);
      socket.off("Edited msg", handleEditedMessage);
      socket.emit("leave room", receiverId, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Left room");
        }
      });
    };
  }, [receiverId]);

  // useEffect(() => {
  //   scrollToBottom();
  // }, [chatData.messages.length, chatData.pendingMessages.length]);

  const [scrollDirection, setScrollDirection] = useState({
    scrollY: 0,
    scrollDirection: "",
  });
  const handleScroll = (el) => {
    const top = el.scrollHeight + el.scrollTop;
    const sctop = el.scrollTop;
    console.log(scrollDirection.scrollY < el.scrollTop);

    setScrollDirection((prev) => ({
      scrollDirection: prev.scrollY < el.scrollTop ? "down" : "up",
      scrollY: sctop,
    }));
    setChatData((prev) => ({
      ...prev,
      direction: scrollDirection.scrollDirection,
    }));
    console.log("Current scroll position:", sctop);
    console.log("Previous scroll position:", scrollDirection.scrollY);
    console.log("Scroll direction:", scrollDirection.scrollDirection);
    // console.log("top:", top);
    // console.log("ScrollTop:", el.scrollTop);
    // console.log("ScrollHeight:", el.scrollHeight);
    // console.log("ClientHeight:", el.clientHeight);
    if (top == el.clientHeight && hasMoreUp) {
      setChatData((prev) => ({
        ...prev,
        reachedTop: true,
      }));
    }
  };
  useEffect(() => {
    const el = div.current;
    if (!el) return;

    const scrollHandler = () => handleScroll(el);
    el.addEventListener("scroll", scrollHandler);

    return () => {
      el.removeEventListener("scroll", scrollHandler);
    };
  }, [div.current, handleScroll]);

  return (
    <>
      <div
        className={`d-flex flex-column-reverse text-white flex-shrink-1 overflow-y-auto custom-scrollbar position-relative w-100`}
        id={"scrollableDiv"}
        ref={div}
      >
        <DmList
          styles={styles}
          messagesEndRef={messagesEndRef}
          setChatData={setChatData}
        />
        <div className={`m-2 ${hasMoreUp ? "d-none" : ""}`}>
          <img
            src={
              receiver.profile ? receiver.profile : "https://placehold.co/80"
            }
            className="rounded-circle"
            alt=""
          />
          <div className="fs-3">{receiver.display_name}</div>
          <div className="fs-5">{receiver.username}</div>
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
        styles={styles}
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
