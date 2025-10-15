import React, { useContext, useEffect, useRef, useState } from "react";
import { useLoaderData, useOutletContext, useParams } from "react-router-dom";
import FriendProfile from "./FriendProfile";
import DmDisplay from "./DmDisplay";
import DmPanelTop from "./DmPanelTop";
import styles from "../css/dm_panel.module.css";
import { socket } from "../socket";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dmDataQuery } from "../loaders";
import toast from "react-hot-toast";

const DmPanel = () => {
  const queryClient = useQueryClient();
  const {
    dmChat: { messages, receivers },
    setDmChat,
    dmHistoryUsers,
    setDmHistoryUsers,
    msgRequests,
    setMsgRequests,
    dmChatRef,
  } = useOutletContext();
  const { initialPageParam, prevChatDataUpdatedAtRef } = dmChatRef.current;
  const { userId: receiverId } = useParams();

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
  const {
    data,
    isSuccess,
    isError,
    error,
    isLoading,
    isFetched,
    dataUpdatedAt,
  } = useQuery(dmDataQuery(receiverId));
  const chatExists = data?.dms != undefined;

  const [showOffset, setShowOffset] = useState(false);
  const handleOffsetToggle = () => setShowOffset((prev) => !prev);

  if (chatExists) {
    // console.log("chatexists 1", socket.auth.serverOffset);
    socket.auth.serverOffset[receiverId] = data.dms[data.dms.length - 1]?.id;
    // console.log("chatexists 2", socket.auth.serverOffset);
  }
  if (isError) {
    toast.error(error.message);
  }

  //* get mgss when being off chat,[add friend, block, report spam],add msg requests. Check blocked users, then friends then this. Being friend or msging back auto accepts it - direct_msg_requests.dont allow user to search blocked one up,but show the msgs still.

  //^ before fethcing chats,allow socket get msgs and save,then fetch chat and merge then rmeove dups

  //^ actual time of pending msg is when its saved to db not at pending

  useEffect(() => {
    if (!isSuccess) return;
    if (receivers[receiverId]) return;

    const { dms, receiver, nextId } = data;
    console.log("dms: ", dms);

    if (dms[0]?.request_state == "pending") {
      console.log(
        "in panel,new req adding cuz current receiverid doesnt exist"
      );

      setMsgRequests((prev) => {
        const isReqFromReceiver = dms[0].from_id == receiverId;

        return isReqFromReceiver
          ? {
              ...prev,
              fromOthers: [...prev.fromOthers, dms[0]],
            }
          : { ...prev, fromMe: [...prev.fromMe, dms[0]] };
      });
    }

    setDmChat((prev) => ({
      ...prev,
      msgToReply: null,
      hasMoreUp: {
        ...prev.hasMoreUp,
        [receiverId]: dms.length < 30 ? false : true,
      },
      receivers: { ...prev.receivers, [receiverId]: receiver },
    }));

    const isUserInDmHistory = dmHistoryUsers.some((i) => i.id == receiverId);

    if (!isUserInDmHistory) {
      setDmHistoryUsers((prev) => [receiver, ...prev]);
    }

    prevChatDataUpdatedAtRef[receiverId] = dataUpdatedAt;
    initialPageParam[receiverId] = nextId;
    socket.auth.serverOffset[receiverId] = dms[dms.length - 1]?.id;
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
