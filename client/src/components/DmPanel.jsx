import React, { useContext, useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import FriendProfile from "./FriendProfile";
import DmPanelTop from "./DmPanelTop";
import styles from "../css/dm_panel.module.css";
import { socket } from "../socket";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dmDataQuery } from "../loaders";
import toast from "react-hot-toast";
import { useHasMoreUpStore } from "../stores/useHasMoreUpStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { useMsgToReplyStore } from "../stores/useMsgToReplyStore.js";
import { Flex } from "@mantine/core";
import DmModalNotifier from "./DmModalNotifier.jsx";
import { useDisclosure } from "@mantine/hooks";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import { useChatMessages } from "../custom-hooks/useChatMessages.js";
import { addDmHistoryUsers } from "../utils/dmHistoryUsers.js";
import {
  addReceivedFriendRequest,
  addSentFriendRequest,
} from "../utils/friendRequests.js";
import { useMessageRequests } from "../custom-hooks/useMessageRequests.js";
import {
  addReceivedMessageRequests,
  addSentMessageRequests,
} from "../utils/msgRequests.js";

const DmPanel = () => {
  const queryClient = useQueryClient();
  const { userId: receiverId } = useParams();
  const { dmChatRef } = useOutletContext();
  const {
    initialPageParam,
    DmPanel: { chatMessagesUpdatedAt },
  } = dmChatRef.current;

  const addToHasMoreUp = useHasMoreUpStore((s) => s.addToHasMoreUp);
  const setMsgToReply = useMsgToReplyStore((s) => s.setMsgToReply);
  const receivers = useReceiverStore((s) => s.receivers);
  const addToReceivers = useReceiverStore((s) => s.addToReceivers);
  const { data } = useMessageRequests();
  const { receivedMessageRequests } = data ?? [];
  const { data: initialDmData, isSuccess: isInitialDmDataSuccess } = useQuery(
    dmDataQuery(receiverId)
  );
  const {
    data: chatMessages,
    fetchNextPage,
    isFetched,
    hasNextPage,
    isLoading,
    isSuccess: isChatMessagesSuccess,
    dataUpdatedAt: chatMessagesQueryUpdatedAt,
  } = useChatMessages(receiverId);

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
    console.log("dm panel");
    console.log(chatMessagesQueryUpdatedAt);

    if (!isChatMessagesSuccess) return;
    if (chatMessagesUpdatedAt[receiverId]) return;

    const { dms } = chatMessages;
    const firstFetchedMsgs = dms.pages[0].messages;
    const setMsgRequest = () => {
      const isReqFromReceiver = firstFetchedMsgs[0].from_id == receiverId;

      isReqFromReceiver
        ? addReceivedMessageRequests(queryClient, firstFetchedMsgs[0])
        : addSentMessageRequests(queryClient, firstFetchedMsgs[0]);
    };
    const isDmsLengthLess = firstFetchedMsgs.length < 30 ? false : true;
    const msgRequestAlreadyExists = receivedMessageRequests.some(
      ({ id }) => id == firstFetchedMsgs[0].id
    );

    if (
      firstFetchedMsgs[0].request_state == "pending" &&
      !msgRequestAlreadyExists
    ) {
      setMsgRequest();
    }

    addToHasMoreUp(receiverId, isDmsLengthLess);
    setMsgToReply(null);

    chatMessagesUpdatedAt[receiverId] = chatMessagesQueryUpdatedAt;
    socket.auth.serverOffset[receiverId] =
      firstFetchedMsgs.length === 0 ? 0 : firstFetchedMsgs.at(-1).id;
  }, [chatMessages]);

  useEffect(() => {
    if (!isInitialDmDataSuccess) return;

    const { receiver, nextId, friendStatus } = isInitialDmDataSuccess;
    const isUserInReceiversObj = receivers[receiverId];
    const isUserInDmHistory = dmHistoryUsers.some(({ id }) => id == receiverId);

    if (!isUserInDmHistory) addDmHistoryUsers(queryClient, [receiver]);
    if (!isUserInReceiversObj) addToReceivers(receiverId, receiver);
    if (friendStatus?.request_state === "pending") {
      friendStatus.user_id == receiverId
        ? addReceivedFriendRequest(queryClient, [receiver])
        : addSentFriendRequest(queryClient, [receiverId]);
    }

    initialPageParam[receiverId] = nextId;
  }, [initialDmData]);

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
            <Box
              c={"white"}
              w={"100%"}
              style={{
                minHeight: 350,
              }}
            >
              <DmList
                key={receiverId}
                isInitialDataLoading={isLoading}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
              />
            </Box>

            <MessageInput key={receiverId} />
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
