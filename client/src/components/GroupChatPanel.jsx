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

const GroupChatPanel = () => {
  const [showOffset, setShowOffset] = useState(false);
  const handleOffsetToggle = () => setShowOffset((prev) => !prev);
  const activeMsg = useRef({
    msg: null,
    type: null,
  });
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
