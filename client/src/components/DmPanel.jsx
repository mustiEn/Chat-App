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
import { useFriendRequestStore } from "../stores/useFriendRequestStore.js";

const DmPanel = () => {
  const { userId: receiverId } = useParams();
  const { dmChatRef } = useOutletContext();
  const { initialPageParam, prevChatDataUpdatedAtRef } = dmChatRef.current;

  const addSentFriendRequest = useFriendRequestStore((s) => s.addSentRequest);
  const addReceivedFriendRequest = useFriendRequestStore(
    (s) => s.addReceivedRequest
  );
  const addSentRequest = useMsgRequestStore((s) => s.addSentRequest);
  const addReceivedRequest = useMsgRequestStore((s) => s.addReceivedRequest);
  const msgRequests = useMsgRequestStore((s) => s.msgRequests);
  const dmHistoryUsers = useDmHistoryUserStore((s) => s.dmHistoryUsers);
  const addToDmHistoryUsers = useDmHistoryUserStore(
    (s) => s.addToDmHistoryUsers
  );
  const addToHasMoreUp = useHasMoreUpStore((s) => s.addToHasMoreUp);
  const setMsgToReply = useMsgToReplyStore((s) => s.setMsgToReply);
  const receivers = useReceiverStore((s) => s.receivers);
  const addToReceivers = useReceiverStore((s) => s.addToReceivers);

  const { data, isSuccess, isLoading, dataUpdatedAt } = useQuery(
    dmDataQuery(receiverId)
  );

  const handleOffsetToggle = () => setShowOffset((prev) => !prev);
  const [showOffset, setShowOffset] = useState(false);
  const [activeMsg, setActiveMsg] = useState({
    msg: null,
    type: null,
  });
  const [opened, { open, close }] = useDisclosure(false);

  //* dont allow user to search blocked one up,but show the msgs still.

  //^ before fethcing chats,allow socket get msgs and save,then fetch chat and merge then rmeove dups - notification

  useEffect(() => {
    if (!isSuccess) return;
    if (prevChatDataUpdatedAtRef[receiverId] === dataUpdatedAt) return;

    const { dms, receiver, nextId, friendStatus } = data;
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

    if (friendStatus?.request_state === "pending") {
      friendStatus.user_id == receiverId
        ? addReceivedFriendRequest([receiver])
        : addSentFriendRequest([receiverId]);
    }
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
