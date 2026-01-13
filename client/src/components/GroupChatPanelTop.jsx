import React from "react";
import { Box, Flex, Title } from "@mantine/core";
import GroupChatPanelTopIcons from "./GroupChatPanelTopIcons.jsx";
import GroupChatPinnedMsgsBoxWrapper from "./GroupChatPinnedMsgsBoxWrapper.jsx";
import stylesPanelTop from "../css/panel_top.module.css";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { closePinnedMsgBox } from "../utils/pinnedMsgBox.js";

const GroupChatPanelTop = ({ showOffset, handleOffsetToggle }) => {
  const customOverlayRef = useRef();
  const pinnedMsgsBoxRef = useRef(null);
  const { groupId } = useParams();
  const pinnedMsgBoxObj = useShowPinnedMsgBoxStore(
    (s) => s.pinnedMsgBoxObj.group
  );
  const switchPinnedMsgBox = useShowPinnedMsgBoxStore(
    (s) => s.switchGroupPinnedMsgBox
  );

  useEffect(() => {
    if (pinnedMsgBoxObj[groupId])
      customOverlayRef.current.style.display = "block";

    const eventCallback = (e) =>
      closePinnedMsgBox(e, groupId, customOverlayRef, switchPinnedMsgBox);

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
          <GroupChatPanelTopIcons
            showOffset={showOffset}
            handleOffsetToggle={handleOffsetToggle}
          />
        </Flex>
        <GroupChatPinnedMsgsBoxWrapper
          customOverlayRef={customOverlayRef}
          ref={pinnedMsgsBoxRef}
        />
      </Box>
    </>
  );
};

export default GroupChatPanelTop;
