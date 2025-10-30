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
import { useMsgRequestStore } from "../stores/useMsgRequestStore.js";
import { useDmHistoryUserStore } from "../stores/useDmHistoryUserStore.js";
import { useHasMoreUpStore } from "../stores/useHasMoreUpStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { useMsgToReplyStore } from "../stores/useMsgToReplyStore.js";
import { Flex } from "@mantine/core";
import DmModalNotifier from "./DmModalNotifier.jsx";
import { useDisclosure } from "@mantine/hooks";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";

const DmPanel = () => {
  const { userId: receiverId } = useParams();
  const addSentRequest = useMsgRequestStore((state) => state.addSentRequest);
  const addReceivedRequest = useMsgRequestStore(
    (state) => state.addReceivedRequest
  );
  const msgRequests = useMsgRequestStore((state) => state.msgRequests);
  const dmHistoryUsers = useDmHistoryUserStore((state) => state.dmHistoryUsers);
  const addToDmHistoryUsers = useDmHistoryUserStore(
    (state) => state.addToDmHistoryUsers
  );
  const addToHasMoreUp = useHasMoreUpStore((state) => state.addToHasMoreUp);
  const setMsgToReply = useMsgToReplyStore((state) => state.setMsgToReply);
  const receivers = useReceiverStore((state) => state.receivers);
  const addToReceivers = useReceiverStore((state) => state.addToReceivers);
  const { dmChatRef } = useOutletContext();
  const { initialPageParam, prevChatDataUpdatedAtRef } = dmChatRef.current;

  const {
    data,
    isSuccess,
    isError,
    error,
    isLoading,
    isFetched,
    dataUpdatedAt,
  } = useQuery(dmDataQuery(receiverId));

  const handleOffsetToggle = () => setShowOffset((prev) => !prev);
  const [showOffset, setShowOffset] = useState(false);
  const [activeMsg, setActiveMsg] = useState({
    msg: null,
    type: null,
  });
  const [opened, { open, close }] = useDisclosure(false);

  if (isError) {
    toast.error(error.message);
  }

  //* dont allow user to search blocked one up,but show the msgs still.

  //^ before fethcing chats,allow socket get msgs and save,then fetch chat and merge then rmeove dups - notification

  useEffect(() => {
    // console.log(socket.auth.serverOffset);
    if (!isSuccess) return;
    if (prevChatDataUpdatedAtRef[receiverId] === dataUpdatedAt) return;

    const { dms, receiver, nextId } = data;
    const setMsgRequest = () => {
      const isReqFromReceiver = dms[0].from_id == receiverId;

      isReqFromReceiver
        ? addReceivedRequest([dms[0]])
        : addSentRequest([dms[0]]);
    };
    const isDmsLengthLess = dms.length < 30 ? false : true;
    const isUserInReceiversObj = receivers[receiverId];
    const isUserInDmHistory = dmHistoryUsers.some(({ id }) => id == receiverId);
    const msgRequestAlreadyExists = msgRequests.receivedRequests.some(
      ({ id }) => id == dms[0].id
    );

    // console.log("dms: ", dms);

    if (dms[0].request_state == "pending" && !msgRequestAlreadyExists)
      setMsgRequest();
    if (!isUserInDmHistory) addToDmHistoryUsers([receiver]);
    if (!isUserInReceiversObj) addToReceivers(receiverId, receiver);

    addToHasMoreUp(receiverId, isDmsLengthLess);
    setMsgToReply(null);

    prevChatDataUpdatedAtRef[receiverId] = dataUpdatedAt;
    initialPageParam[receiverId] = nextId;
    socket.auth.serverOffset[receiverId] =
      dms.length == 0 ? 0 : dms[dms.length - 1].id;
  }, [data]);

  return (
    <>
      <DmPanelContext value={{ open, setActiveMsg, opened, close, activeMsg }}>
        <DmPanelTop
          key={receiverId}
          handleOffsetToggle={handleOffsetToggle}
          showOffset={showOffset}
        />
        <Flex
          w={"100%"}
          style={{
            minHeight: 0,
            flexGrow: 1,
          }}
        >
          <Flex
            id={styles["dmPanelContent"]}
            direction={"column"}
            gap={"xs"}
            w={"100%"}
          >
            <DmDisplay key={receiverId} isInitialDataLoading={isLoading} />
          </Flex>

          <FriendProfile
            friend={receivers[receiverId] ?? []}
            showOffset={showOffset}
          />
        </Flex>
      </DmPanelContext>
      <DmModalNotifier
        activeMsg={activeMsg}
        setActiveMsg={setActiveMsg}
        show={opened}
        close={close}
      />
    </>
  );
};

export default DmPanel;
