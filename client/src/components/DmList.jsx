import React, { useState, useContext, memo, useEffect, useRef } from "react";
import DmItem from "./DmItem.jsx";
import DmContext from "../contexts/DmContext.jsx";
import { PulseLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import MyLoader from "./InfiniteLoader.jsx";
import toast from "react-hot-toast";
import PinMsgModal from "./PinMsgModal.jsx";
import DmModalNotifier from "./DmModalNotifier.jsx";
import { socket } from "../socket.js";

const DmList = memo(function DmList({ messagesEndRef }) {
  const { userId: receiverId } = useParams();
  const {
    chatData: { messages, pendingMessages },
    setChatData,
  } = useContext(DmContext);
  const typeRef = useRef(null);
  const fetchMoreData = async () => {
    const offset = messages.length;
    try {
      const res = await fetch(`/api/dm/${offset}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg);
      }

      const { dms } = data;

      if (!dms.length) {
        setChatData((prev) => ({
          ...prev,
          reachedTop: false,
          hasMoreUp: false,
        }));
        return;
      }
      setChatData((prev) => ({
        ...prev,
        reachedTop: false,
        messages: [...prev.messages, ...dms],
      }));
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };
  const [modal, setModal] = useState({
    activeMsg: null,
    show: false,
  });
  const handleDmModalNotifier = (msg, type) => {
    setModal({ activeMsg: msg, show: true });
    typeRef.current = type;
  };
  const pinMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't pin the message");
      return;
    }
    socket.emit(
      "pinned msgs",
      {
        id: modal.activeMsg.id,
        isPinned: true,
      },
      (err, res) => {
        if (err) {
          console.log("err", err);
        } else {
          console.log("res", res);
        }
      }
    );
    setModal({
      activeMsg: null,
      show: false,
    });
  };
  const deleteMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't delete the message");
      return;
    }
    socket.emit(
      "deleted msgs",
      {
        id: modal.activeMsg.id,
      },
      (err, res) => {
        if (err) {
          console.log("err", err);
        } else {
          console.log("res", res);
        }
      }
    );
  };

  useEffect(() => console.log("type", typeRef), [typeRef.current]);

  return (
    <>
      {messages.length === 0 ? (
        <div className="empty-state">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <MyLoader next={fetchMoreData} loader={<PulseLoader color={"white"} />}>
          <ul className="d-flex flex-column-reverse gap-3 m-2">
            {[...pendingMessages, ...messages].map((msg) => (
              <DmItem
                key={msg.id ?? msg.clientOffset}
                msg={msg}
                handleDmModalNotifier={handleDmModalNotifier}
              />
            ))}
            <div ref={messagesEndRef} />
          </ul>
        </MyLoader>
      )}
      <DmModalNotifier
        type={typeRef.current}
        activeMsg={modal.activeMsg}
        func={typeRef.current == "Pin" ? pinMessage : deleteMessage}
        show={modal.show}
        setModal={setModal}
      />
    </>
  );
});

export default DmList;
