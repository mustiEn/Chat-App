import React, { useMemo, useRef } from "react";
import { Box, Flex, Text } from "@mantine/core";
import { useState } from "react";
import GroupChatPanelTop from "./GroupChatPanelTop";
import { GroupChatPanelContext } from "../contexts/GroupChatPanelContext";
import PanelModalNotifier from "./PanelModalNotifier";
import GroupMessageInput from "./GroupMessageInput.jsx";
import GroupMessageList from "./GroupMessageList";
import GroupMembers from "./GroupMembers";
import styles from "../css/panel.module.css";
import { useEffect } from "react";

const GroupChatPanel = () => {
  const [showOffset, setShowOffset] = useState(false);
  const handleOffsetToggle = () => setShowOffset((prev) => !prev);
  const activeMsg = useRef({
    msg: null,
    type: null,
  });

  // useEffect(() => {
  //   if (!isSuccess) return;

  //   const { receiver, friendStatus } = initialDmData;
  //   const isUserInReceiversObj = receivers[receiver.id];
  //   const dmHistoryUsers = queryClient.getQueryData(["dmHistory"]);
  //   const isUserInDmHistory =
  //     dmHistoryUsers && dmHistoryUsers.some((e) => e.id == receiver.id);

  //   if (!isUserInDmHistory)
  //     addDmHistoryUsers(queryClient, [{ ...receiver, chatId }]);
  //   if (!isUserInReceiversObj)
  //     addToReceivers(receiver.id, { ...receiver, chatId });
  //   if (friendStatus?.request_state === "pending") {
  //     friendStatus.user_id == receiver.id
  //       ? addReceivedFriendRequest(queryClient, [receiver])
  //       : addSentFriendRequest(queryClient, [
  //           { id: receiver.id, username: receiver.username },
  //         ]);
  //   }
  //   // initialPageParam[recevierId] = nextId;
  // }, [initialDmData]);

  const value = useMemo(() => ({ activeMsg }), [activeMsg]);

  return (
    <>
      <GroupChatPanelContext value={value}>
        <GroupChatPanelTop
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
              <GroupMessageList />
            </Box>

            <GroupMessageInput />
          </Flex>

          <GroupMembers showOffset={showOffset} />
        </Flex>
        <PanelModalNotifier activeMsg={activeMsg} panelName={"group"} />
      </GroupChatPanelContext>
    </>
  );
};

export default GroupChatPanel;
