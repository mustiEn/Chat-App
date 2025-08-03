import React, { useState, useContext, memo } from "react";
import DmItem from "./DmItem.jsx";
import DmContext from "../contexts/DmContext.jsx";
import { PulseLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import MyLoader from "./InfiniteLoader.jsx";
import toast from "react-hot-toast";
import PinMsgModal from "./PinMsgModal.jsx";
import styles from "../css/dm_panel.module.css";

const DmList = memo(function DmList({ messagesEndRef }) {
  const { userId: receiverId } = useParams();
  const {
    chatData: { messages, pendingMessages },
    setChatData,
  } = useContext(DmContext);
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
  const [activeMsg, setActiveMsg] = useState(false);
  const [showPinMsgModal, setShowPinMsgModal] = useState(false);
  const handlePinMsgModal = (msg = null) => {
    setShowPinMsgModal(msg ? true : false);
    if (msg != null) setActiveMsg(msg);
  };

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
                styles={styles}
                handlePinMsgModal={handlePinMsgModal}
              />
            ))}
            <div ref={messagesEndRef} />
          </ul>
        </MyLoader>
      )}
      <PinMsgModal
        show={showPinMsgModal}
        handlePinMsgModal={handlePinMsgModal}
        activeMsg={activeMsg}
      />
    </>
  );
});

export default DmList;
