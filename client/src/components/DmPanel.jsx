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
  const { receiver, dms, pinnedMessages } = useLoaderData();
  const [props, setProps] = useState({
    receiver: receiver,
    dms: dms,
    pinnedMessages: pinnedMessages,
  });
  const div = useRef(null);
  const [chatData, setChatData] = useState({
    messages: dms,
    authenticatedUserId: socket.auth.userId,
    pendingMessages: [],
    pendingEditedMessages: [],
    pinnedMessagesView: [],
    direction: "",
    reachedTop: false,
    reachedBottom: false,
    isPinnedMsgViewOpen: false,
    jumpToMsgId: null,
    hasMoreUp: true,
    hasMoreDown: false,
  });
  const { userId: receiverId } = useParams();
  const [prevReceiverId, setPrevReceiverId] = useState(receiverId);
  const mounted = useRef(false);
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

  if (!mounted.current) {
    mounted.current = true;
  } else {
    if (prevReceiverId !== receiverId) {
      setPrevReceiverId(receiverId);
      (async () => {
        try {
          const res = await fetch(`/api/dm/0`, {
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

          const { dms, receiver, pinnedMessages } = data;

          setProps({
            receiver: receiver,
            dms: dms,
            pinnedMessages: pinnedMessages,
          });
          setChatData((prev) => ({
            ...prev,
            pendingMessages: [],
            pendingEditedMessages: [],
            pinnedMessagesView: [],
            isPinnedMsgViewOpen: false,
            jumpToMsgId: null,
            direction: "",
            hasMoreUp: true,
            hasMoreDown: false,
            messages: dms,
          }));
          socket.auth.serverOffset = dms[dms.length - 1]?.id;
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      })();
    }
  }

  // useEffect(() => {
  //   console.log("PANEL", chatData.div);
  // }, [chatData.div]);

  return (
    <>
      <DmContext.Provider value={value}>
        <DmPanelTop
          receiver={receiver}
          pinnedMessages={props.pinnedMessages}
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
            <DmDisplay
              dmData={props}
              prevReceiverId={prevReceiverId}
              styles={styles}
              receiverId={receiverId}
              // key={receiverId}
            />
          </div>
          <FriendProfile
            friend={receiver}
            showOffset={showOffset}
            styles={styles}
          />
        </div>
      </DmContext.Provider>
    </>
  );
};

export default DmPanel;
