import React, { useContext, useEffect, useRef, useState } from "react";
import { useLoaderData, useOutletContext, useParams } from "react-router-dom";
import FriendProfile from "./FriendProfile";
import DmDisplay from "./DmDisplay";
import DmPanelTop from "./DmPanelTop";
import styles from "../css/dm_panel.module.css";
import { socket } from "../socket";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";

const DmPanel = () => {
  const {
    dmChat: { messages, receivers },
    setDmChat,
    dmChatRef,
  } = useOutletContext();
  const { initialPageParam } = dmChatRef.current;
  const { userId: receiverId } = useParams();
  const chatExists = messages[receiverId] != undefined;
  const fetchInitialChat = async () => {
    const res = await fetch(`/api/dm/initialData/0`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId }),
    });
    const data = await res.json();
    console.log("react query intial");

    if (!res.ok) throw new Error(data.error);

    return data;
  };
  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["initalChatData", receiverId],
    queryFn: fetchInitialChat,
    enabled: !chatExists,
  });

  const [showOffset, setShowOffset] = useState(false);
  const handleOffsetToggle = () => setShowOffset((prev) => !prev);

  if (chatExists) {
    // console.log("chatexists 1", socket.auth.serverOffset);
    socket.auth.serverOffset =
      messages[receiverId][messages[receiverId].length - 1]?.id;
    // console.log("chatexists 2", socket.auth.serverOffset);
  }
  if (isError) {
    toast.error(error.message);
  }

  //* get mgss when being off chat

  useEffect(() => {
    if (!isSuccess) return;
    if (chatExists) return;
    const { dms, receiver, nextId } = data;

    setDmChat((prev) => ({
      ...prev,
      msgToReply: null,
      messages: { ...prev.messages, [receiverId]: dms },
      hasMoreUp: {
        ...prev.hasMoreUp,
        [receiverId]: dms.length < 30 ? false : true,
      },
      receivers: { ...prev.receivers, [receiverId]: receiver },
    }));
    initialPageParam[receiverId] = nextId;

    socket.auth.serverOffset = dms[dms.length - 1]?.id;
  }, [data]);

  return (
    <>
      <DmPanelTop
        key={receiverId}
        receiver={receivers[receiverId] ?? []}
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
            // key={receiverId}
            receiver={receivers[receiverId] ?? []}
            isInitialDataLoading={isLoading}
          />
        </div>

        <FriendProfile
          friend={receivers[receiverId] ?? []}
          showOffset={showOffset}
        />
      </div>
    </>
  );
};

export default DmPanel;
