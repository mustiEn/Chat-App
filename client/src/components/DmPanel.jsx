import React, { useEffect, useRef, useState } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import FriendProfile from "./FriendProfile";
import DmDisplay from "./DmDisplay";
import DmPanelTop from "./DmPanelTop";
import styles from "../css/dm_panel.module.css";
import { socket } from "../socket";
import DmContext from "../contexts/DmContext";
import { useMemo } from "react";

const DmPanel = () => {
  const { receiver, dms } = useLoaderData();
  const div = useRef(null);
  const [chatData, setChatData] = useState({
    messages: dms,
    authenticatedUserId: socket.auth.userId,
    pendingMessages: [],
    pendingEditedMessages: [],
    pinnedMsgs: [],
    newPinnedMsgs: false,
    reachedTop: false,
    hasMoreUp: true,
  });
  const { userId: receiverId } = useParams();
  const [prevReceiverId, setPrevReceiverId] = useState(receiverId);
  const [showOffset, setShowOffset] = useState(false);

  const handleOffsetToggle = () => setShowOffset((prev) => !prev);
  const value = useMemo(
    () => ({
      chatData,
      setChatData,
      div,
    }),
    [chatData, receiverId, div]
  );

  if (prevReceiverId != receiverId) {
    setPrevReceiverId(receiverId);
    setChatData({
      authenticatedUserId: socket.auth.userId,
      pendingMessages: [],
      pendingEditedMessages: [],
      pinnedMsgs: [],
      newPinnedMsgs: false,
      reachedTop: false,
      hasMoreUp: true,
      messages: dms,
    });
    socket.auth.serverOffset = dms[dms.length - 1]?.id;
  }

  return (
    <>
      <DmContext value={value}>
        <DmPanelTop
          key={receiverId}
          receiver={receiver}
          styles={styles}
          handleOffsetToggle={handleOffsetToggle}
          showOffset={showOffset}
        />
        <div
          className="d-flex flex-grow-1 w-100"
          style={{
            minHeight: 0,
          }}
        >
          <div
            id={styles["dmPanelContent"]}
            className={`w-100 d-flex flex-column position-relative gap-2`}
          >
            <DmDisplay receiver={receiver} styles={styles} key={receiverId} />
          </div>
          <FriendProfile
            friend={receiver}
            showOffset={showOffset}
            styles={styles}
          />
        </div>
      </DmContext>
    </>
  );
};

export default DmPanel;
