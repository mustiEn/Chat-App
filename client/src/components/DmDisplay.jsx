import React from "react";
import { LuDot } from "react-icons/lu";
import Button from "react-bootstrap/esm/Button";
import { socket } from "../socket.js";
import { useEffect } from "react";
import "../css/chat.css";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { v4 as uuidv4 } from "uuid";

dayjs.extend(utc);
dayjs.extend(timezone);

const DmDisplay = () => {
  const { userId: receiverId } = useParams();
  const [message, setMessage] = useState("");
  const [chatData, setChatData] = useState({
    messages: [],
    authenticatedUserId: "",
    pendingMessages: [],
  });
  const [isConnected, setIsConnected] = useState(socket.connected);
  const messagesEndRef = useRef(null);
  const handleNewMessage = ({ msg, state }) => {
    if (state) {
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
          messages: [...prev.messages, { ...msg, ispending: false }],
        };
      });
    } else {
      setChatData((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            message: msg.message,
            createdAt: msg.createdAt,
            from_id: msg.from_id,
            to_id: msg.to_id,
            id: msg.id,
          },
        ],
      }));
    }
    socket.auth.serverOffset = msg.id;
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
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const formatDate = (date) => {
    const input = dayjs.utc(date).local();
    let format;
    const today = dayjs().startOf("day");
    const yesterday = dayjs().subtract(1, "day").startOf("day");

    if (input.isSame(today, "day")) {
      format = input.format("hh:mm");
    } else if (input.isSame(yesterday, "day")) {
      format = `Yesterday at ${input.format("hh:mm")}`;
    } else {
      format = input.format("D/M/YYYY, hh:mm");
    }
    return format;
  };
  const handleSubmit = (e) => {
    const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const clientOffset = uuidv4();

    e.preventDefault();
    setMessage("");

    if (!socket.connected) {
      setChatData((prev) => ({
        ...prev,
        pendingMessages: [
          ...prev.pendingMessages,
          {
            message: message,
            createdAt: time,
            from_id: prev.authenticatedUserId,
            to_id: receiverId,
            clientOffset: clientOffset,
            ispending: true,
          },
        ],
      }));
    }

    socket.emit(
      "dm",
      {
        message: message,
        receiverId: receiverId,
        createdAt: time,
      },
      clientOffset,
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
    const getChatHistory = async () => {
      try {
        const res = await fetch(`/api/get-dm-history/${receiverId}`);
        const { dms, userId: sender } = await res.json();
        if (res.ok) {
          console.log(dms.length);

          setChatData((prev) => ({
            ...prev,
            messages: dms,
            authenticatedUserId: sender,
          }));
          socket.auth.serverOffset = dms[dms.length - 1]?.id;
        }
        console.log(dms, sender);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    getChatHistory();
    onConnect();
    socket.on("dm", handleNewMessage);
    socket.auth.receiverId = receiverId;

    return () => {
      socket.off("dm", handleNewMessage);
      socket.emit("leave room", receiverId, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Left room");
        }
      });
    };
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
    console.log(chatData);
  }, [chatData]);

  return (
    <>
      <div className="flex-grow-1 text-white overflow-y-auto custom-scrollbar">
        {/* {msg.length == 0 ? (

        )} */}
        <div className="m-2">
          <img
            src="https://placehold.co/80"
            className="rounded-circle"
            alt=""
          />
          <div className="fs-3">Github2Dev</div>
          <div className="fs-5">Github2Dev_3432</div>
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

        {/* <ul className="h-100 m-2">
          {msg.map((i) => (
            <li className="mt-4" key={i}>
              {i}
            </li>
          ))}
        </ul> */}
        <div id="chatPanel" className="h-100 m-2 chat-container">
          <div
            className={`connection-status ${
              isConnected ? "connected" : "disconnected"
            }`}
          >
            {isConnected ? (
              <span>✔ Online</span>
            ) : (
              <div>
                <span>⚠ Connecting...</span>
                <button
                  onClick={() => socket.connect()}
                  className="reconnect-btn"
                >
                  Reconnect
                </button>
              </div>
            )}
          </div>

          <div className="messages-container">
            {chatData.messages.length === 0 ? (
              <div className="empty-state">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <ul className="messages-list">
                {[...chatData.messages, ...chatData.pendingMessages].map(
                  (msg) => (
                    <li
                      key={msg?.id || msg.clientOffset}
                      className={`message-bubble ${
                        msg.from_id === chatData.authenticatedUserId
                          ? "sent"
                          : "received"
                      }`}
                    >
                      <div className="message-content">{msg.message}</div>
                      <div className="message-meta">
                        <span className="message-time">
                          {formatDate(msg.createdAt)}
                          {msg?.ispending ? "Pending" : "Done!"}
                        </span>
                      </div>
                    </li>
                  )
                )}
                <div ref={messagesEndRef} />
              </ul>
            )}
          </div>

          <form onSubmit={handleSubmit} className="message-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              // disabled={!isConnected}
              autoFocus
            />
            <button
              type="submit"
              // disabled={!message.trim() || !isConnected}
              className="send-button"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DmDisplay;
