import React, { useContext, useEffect, useRef, useState } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import FriendProfile from "./FriendProfile";
import DmDisplay from "./DmDisplay";
import DmPanelTop from "./DmPanelTop";
import styles from "../css/dm_panel.module.css";
import { socket } from "../socket";
import DmContext from "../contexts/DmContext";
import { useMemo } from "react";
import { CachedContext } from "../contexts/CacheContext";

const DmPanel = () => {
  const { cachedChat, setCachedChat, cachedReceiver, setCachedReceiver } =
    useContext(CachedContext);
  const { receiver, dms } = useLoaderData();
  const div = useRef(null);
  const [chatData, setChatData] = useState({
    messages: [],
    authenticatedUserId: socket.auth.userId,
    pendingMessages: [],
    pendingEditedMessages: [],
    pinnedMsgs: [],
    newPinnedMsgs: false,
    msgToReply: null,
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

  // if (prevReceiverId != receiverId) {
  //   setPrevReceiverId(receiverId);
  //   setChatData({
  //     authenticatedUserId: socket.auth.userId,
  //     pendingMessages: [],
  //     pendingEditedMessages: [],
  //     pinnedMsgs: [],
  //     newPinnedMsgs: false,
  //     msgToReply: null,
  //     reachedTop: false,
  //     hasMoreUp: true,
  //     messages: dms,
  //   });
  //   socket.auth.serverOffset = dms[dms.length - 1]?.id;
  // }

  useEffect(() => {
    const existing = cachedChat.get(receiverId);
    if (existing) {
      console.log("cachedChat.get(receiverId) exists", existing);
      setChatData((cd) => ({ ...cd, messages: existing }));
      socket.auth.serverOffset = existing[existing.length - 1]?.id;
    } else {
      console.log("cachedChat.get(receiverId) dont exist", existing);
      (async () => {
        try {
          const res = await fetch(`/api/dm/0`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId }),
          });
          const { dms } = await res.json();
          setChatData((cd) => ({ ...cd, messages: dms }));
          setCachedChat((prev) => {
            const newMap = new Map(prev);
            newMap.set(receiverId, dms);
            return newMap;
          });
          setCachedReceiver((prev) => {
            const newMap = new Map(prev);
            newMap.set(receiverId, receiver);
            return newMap;
          });
          // also set socket offset if you need it
          socket.auth.serverOffset = dms[dms.length - 1]?.id;
        } catch (err) {
          console.error("Failed to load DMs:", err);
        }
      })();
    }
  }, [receiverId]);

  useEffect(() => console.log("cached chat data", cachedChat), [cachedChat]);

  return (
    <>
      <DmContext value={value}>
        <DmPanelTop
          key={receiverId}
          receiver={receiver}
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
            <DmDisplay receiver={receiver} key={receiverId} />
          </div>
          <FriendProfile friend={receiver} showOffset={showOffset} />
        </div>
      </DmContext>
    </>
  );
};

export default DmPanel;
