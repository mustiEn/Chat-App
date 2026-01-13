import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import FriendProfile from "./FriendProfile";
import DmPanelTop from "./DmPanelTop";
import { useQueryClient } from "@tanstack/react-query";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Box, Flex } from "@mantine/core";
import DmList from "./DmList.jsx";
import DmInput from "./DmInput.jsx";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import { addDmHistoryUsers } from "../utils/dmHistoryUsers.js";
import {
  addReceivedFriendRequest,
  addSentFriendRequest,
} from "../utils/friendRequests.js";
import { useMemo } from "react";
import { useDmData } from "../custom-hooks/useDmData.js";
import PanelModalNotifier from "./PanelModalNotifier.jsx";
import styles from "../css/panel.module.css";
import { useDirectMessages } from "../custom-hooks/useDirectMessages.js";
import { usePendingMsgStore } from "../stores/usePendingMsgStore.js";
import { useHeaderStore } from "../stores/useHeaderStore.js";

const DmPanel = () => {
  const queryClient = useQueryClient();
  const { chatId } = useParams();
  const setHeader = useHeaderStore((s) => s.setHeader);
  const receivers = useReceiverStore((s) => s.receivers);
  const addReceiver = useReceiverStore((s) => s.addReceiver);
  const { data: initialDmData, isSuccess } = useDmData(chatId);
  const [showOffset, setShowOffset] = useState(false);
  const handleOffsetToggle = () => setShowOffset((prev) => !prev);
  const activeMsg = useRef({
    msg: null,
    type: null,
  });

  //* dont allow user to search blocked one up,but show the msgs still.

  //^ before fethcing chats,allow socket get msgs and save,then fetch chat and merge then rmeove dups - notification

  useEffect(() => {
    if (!isSuccess) return;

    const { receiver, friendStatus } = initialDmData;
    const isUserInReceiversObj = receivers[receiver.id];
    const dmHistoryUsers = queryClient.getQueryData(["dmHistory"]);
    const isUserInDmHistory =
      dmHistoryUsers && dmHistoryUsers.some((e) => e.id == receiver.id);

    if (!isUserInDmHistory)
      addDmHistoryUsers(queryClient, [{ ...receiver, chatId }]);
    if (!isUserInReceiversObj)
      addReceiver(receiver.id, { ...receiver, chatId });
    if (friendStatus?.request_state === "pending") {
      friendStatus.user_id == receiver.id
        ? addReceivedFriendRequest(queryClient, [receiver])
        : addSentFriendRequest(queryClient, [
            { id: receiver.id, username: receiver.username },
          ]);
    }
    // initialPageParam[recevierId] = nextId;
  }, [initialDmData]);

  useEffect(() => {
    setHeader("Direct Messages");
  }, []);

  const value = useMemo(
    () => ({ activeMsg, receiverId: initialDmData?.receiver.id }),
    [activeMsg, initialDmData]
  );
  return (
    <>
      <DmPanelContext value={value}>
        {initialDmData?.receiver.id && (
          <>
            <DmPanelTop
              // key={receiverId}
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
                id={styles["panelContent"]}
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
                  <DmList />
                </Box>

                <DmInput />
              </Flex>

              <FriendProfile
                friend={initialDmData.receiver}
                showOffset={showOffset}
              />
            </Flex>
          </>
        )}
      </DmPanelContext>
      {initialDmData?.receiver.id && (
        <PanelModalNotifier activeMsg={activeMsg} panelName={"dm"} />
      )}
    </>
  );
};

export default DmPanel;
