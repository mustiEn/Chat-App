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
import { useHeaderStore } from "../stores/useHeaderStore.js";
import { useGroups } from "../custom-hooks/useGroups.js";
import { useParams } from "react-router-dom";

const GroupChatPanel = () => {
  const [showOffset, setShowOffset] = useState(false);
  const handleOffsetToggle = () => setShowOffset((prev) => !prev);
  const activeMsg = useRef({
    msg: null,
    type: null,
  });
  const setHeader = useHeaderStore((s) => s.setHeader);
  const { groupId } = useParams();
  const { data: groups } = useGroups();
  const group = groups?.find(({ group_id }) => group_id === groupId) ?? [];

  useEffect(() => {
    setHeader(group?.group_name);
  }, []);

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
