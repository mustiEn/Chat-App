import React, { useContext, useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import FriendProfile from "./FriendProfile";
import DmPanelTop from "./DmPanelTop";
import styles from "../css/dm_panel.module.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dmDataQuery } from "../loaders";
import toast from "react-hot-toast";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Box, Flex } from "@mantine/core";
import DmList from "./DmList.jsx";
import MessageInput from "./MessageInput.jsx";
import DmModalNotifier from "./DmModalNotifier.jsx";
import { useDisclosure } from "@mantine/hooks";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import { addDmHistoryUsers } from "../utils/dmHistoryUsers.js";
import {
  addReceivedFriendRequest,
  addSentFriendRequest,
} from "../utils/friendRequests.js";
import { useMemo } from "react";

const DmPanel = () => {
  const queryClient = useQueryClient();
  const { chatId } = useParams();
  const { dmChatRef } = useOutletContext();
  const { initialPageParam } = dmChatRef.current;

  const receivers = useReceiverStore((s) => s.receivers);
  const addToReceivers = useReceiverStore((s) => s.addToReceivers);
  const { data: initialDmData, isSuccess: isInitialDmDataSuccess } = useQuery(
    dmDataQuery(chatId)
  );

  const handleOffsetToggle = () => setShowOffset((prev) => !prev);
  const [showOffset, setShowOffset] = useState(false);
  const activeMsg = useRef({
    msg: null,
    type: null,
  });

  //* dont allow user to search blocked one up,but show the msgs still.

  //^ before fethcing chats,allow socket get msgs and save,then fetch chat and merge then rmeove dups - notification

  useEffect(() => {
    if (!isInitialDmDataSuccess) return;

    const { receiver, friendStatus } = initialDmData;
    const isUserInReceiversObj = receivers[receiver.id];
    const dmHistoryUsers = queryClient.getQueryData(["dmHistory"]);
    const isUserInDmHistory =
      dmHistoryUsers && dmHistoryUsers.some((e) => e.id == receiver.id);

    if (!isUserInDmHistory)
      addDmHistoryUsers(queryClient, [{ ...receiver, chatId }]);
    if (!isUserInReceiversObj)
      addToReceivers(receiver.id, { ...receiver, chatId });
    if (friendStatus?.request_state === "pending") {
      friendStatus.user_id == receiver.id
        ? addReceivedFriendRequest(queryClient, [receiver])
        : addSentFriendRequest(queryClient, [
            { id: receiver.id, username: receiver.username },
          ]);
    }
    // initialPageParam[recevierId] = nextId;
  }, [initialDmData]);

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
                  <DmList />
                </Box>

                <MessageInput />
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
        <DmModalNotifier
          activeMsg={activeMsg}
          receiverId={initialDmData.receiver.id}
        />
      )}
    </>
  );
};

export default DmPanel;
