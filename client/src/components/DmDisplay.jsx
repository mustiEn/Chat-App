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

const DmDisplay = ({ dmData, styles, receiverId }) => {
  const { receiver } = dmData;
  const [message, setMessage] = useState("");
  //* const value = useMemo(() => ({ chatData, setChatData }), [chatData]);
  const {
    chatData,
    chatData: { hasMoreUp, hasMoreDown, messages, reachedBottom },
    setChatData,
    div,
  } = useContext(DmContext);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const fileInpRef = useRef(null);
  const textInpRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollY = useRef(0);
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
      setChatData((prev) => ({
        ...prev,
        messages: [msg, ...prev.messages],
      }));
    }
    // console.log("new msg", msg);

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
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const top = scrollHeight + scrollTop;
      const direction = scrollY.current < scrollTop ? "down" : "up";

      scrollY.current = scrollTop;
      setChatData((prev) => ({
        ...prev,
        direction: direction,
      }));

      // console.log("direciton", direction);
      // console.log(scrollY.current < scrollTop, direction);
      console.log("Current scroll position:", scrollTop);
      // console.log("Previous scroll position2:", scrollY.current);
      // console.log("top:", top);
      // console.log("ScrollHeight:", scrollHeight);
      // console.log("ClientHeight:", clientHeight);
      if (top == clientHeight && hasMoreUp) {
        console.log("set reached top true");
        setChatData((prev) => ({
          ...prev,
          reachedTop: true,
        }));
      } else if (scrollTop == 0 && hasMoreDown) {
        console.log("set reached bottom true");
        setChatData((prev) => ({
          ...prev,
          reachedBottom: true,
        }));
      }
      // console.log("hasMoreUp:", hasMoreUp);
      // console.log("hasMoreDown:", hasMoreDown);
    },
    [hasMoreDown, hasMoreUp]
  );

  useEffect(() => {
    console.log("reach bottom changed", reachedBottom);
  }, [reachedBottom]);

  useEffect(() => {
    onConnect();
    socket.on("dm", handleNewMessage);
    socket.on("Edited msg", handleEditedMessage);
    socket.auth.receiverId = receiverId;

    if (textInpRef.current) {
      textInpRef.current.focus();
    }

    if (messages.length) {
      scrollToBottom();
    }

    const el = div?.current;
    // console.log("ref in receiverId", el);

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
  //   const el = ref;
  //   console.log("ref changed", el);

  //   if (el?.current) {
  //     setChatData((prev) => ({
  //       ...prev,
  //       ref: { ref: el, current: el.current, num: prev.ref.num + 1 },
  //     }));
  //   }

  //   return () => console.log("ref changed unmount", el);
  // }, [ref, ref?.current]);

  useEffect(() => {
    const el = div?.current;

    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    // console.log(chatData.ref);

    // console.log("evetn added");

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [div?.current, div?.current, receiverId, handleScroll]);

  // useEffect(() => {
  //   if (!div?.current) return;

  //   console.log("DOM node is now available:", div?.current);
  // }, [div?.current]);

  return (
    <>
      <div
        className={`d-flex flex-column-reverse text-white flex-shrink-1 overflow-y-auto custom-scrollbar position-relative w-100`}
        id={"scrollableref"}
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
