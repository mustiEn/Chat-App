import React from "react";
import { Box, Flex, Title } from "@mantine/core";
import GroupChatPanelTopIcons from "./GroupChatPanelTopIcons.jsx";
import GroupChatPinnedMsgsBox from "./GroupChatPinnedMsgsBox.jsx";
import stylesPanelTop from "../css/dm_panel_top.module.css";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const GroupChatPanelTop = ({ showOffset, handleOffsetToggle }) => {
  const customOverlayRef = useRef();
  const pinnedMsgsBoxRef = useRef(null);

  const { groupId } = useParams();
  const queryClient = useQueryClient();
  const groups = [];
  const pinnedMsgBoxObj = useShowPinnedMsgBoxStore((s) => s.pinnedMsgBoxObj.dm);
  const switchPinnedMsgBox = useShowPinnedMsgBoxStore(
    (s) => s.switchPinnedMsgBox.group
  );

  useEffect(() => {
    const eventCallback = closePinnedMsgsBox(
      e,
      pinnedMsgBoxObj,
      groupId,
      customOverlayRef,
      isTargetOverlay,
      switchPinnedMsgBox
    );

    document.addEventListener("click", eventCallback);

    return () => {
      document.removeEventListener("click", eventCallback);
    };
  }, [pinnedMsgBoxObj]);

  return (
    <>
      <Box
        className={stylesPanelTop["custom-overlay"]}
        ref={customOverlayRef}
      ></Box>
      <Box className={"panel-top"}>
        <Flex h={"100%"} w={"100%"} c={"white"} pr={10} pl={10}>
          {/* ! count of Online people */}
          <Title order={5}>123 people online</Title>
          <GroupChatPanelTopIcons
            showOffset={showOffset}
            handleOffsetToggle={handleOffsetToggle}
          />
        </Flex>
        <GroupChatPinnedMsgsBox
          customOverlayRef={customOverlayRef}
          ref={pinnedMsgsBoxRef}
        />
      </Box>
    </>
  );
};

export default GroupChatPanelTop;
