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
import { useMsgRequestStore } from "../stores/useMsgRequestStore";
import { useShallow } from "zustand/shallow";
import { useDmHistoryUserStore } from "../stores/useDmHistoryUserStore";
import { useHasMoreUpStore } from "../stores/useHasMoreUpStore";
import { useReceiverStore } from "../stores/useReceiverStore";
import { useMsgToReplyStore } from "../stores/useMsgToReplyStore";

const DmPanel = () => {
  const [addToMyRequests, addToOthersRequests] = useMsgRequestStore(
    useShallow((state) => [state.addToMyRequests, state.addToOthersRequests])
  );
  const [dmHistoryUsers, addToDmHistoryUsers] = useDmHistoryUserStore(
    useShallow((state) => [state.dmHistoryUsers, state.addToDmHistoryUsers])
  );
  const addToHasMoreUp = useHasMoreUpStore((state) => state.addToHasMoreUp);
  const setMsgToReply = useMsgToReplyStore((state) => state.setMsgToReply);
  const [receivers, addToReceivers] = useReceiverStore(
    useShallow((state) => [state.receivers, state.addToReceivers])
  );
  const { dmChatRef } = useOutletContext();
  const { initialPageParam, prevChatDataUpdatedAtRef } = dmChatRef.current;
  const { userId: receiverId } = useParams();
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
    const setMsgRequest = () => {
      const isReqFromReceiver = dms[0].from_id == receiverId;

      isReqFromReceiver
        ? addToOthersRequests([dms[0]])
        : addToMyRequests([dms[0]]);
    };
    console.log("dms: ", dms);

    if (dms[0]?.request_state == "pending") setMsgRequest();

    const isDmsLengthLess = dms.length < 30 ? false : true;
    addToHasMoreUp(receiverId, isDmsLengthLess);
    setMsgToReply(null);
    addToReceivers(receiverId, receiver);

    const isUserInDmHistory = dmHistoryUsers.some(({ id }) => id == receiverId);

    if (!isUserInDmHistory) addToDmHistoryUsers([receiver]);

    prevChatDataUpdatedAtRef[receiverId] = dataUpdatedAt;
    initialPageParam[receiverId] = nextId;
    socket.auth.serverOffset[receiverId] = dms[dms.length - 1]?.id;
  }, [data]);

  // useEffect(() => {
  //   console.log("DM panel");
  // }, []);

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
