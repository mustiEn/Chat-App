import React, { useContext, useRef, useState } from "react";
import { RxDrawingPin } from "react-icons/rx";
import { BsPersonLinesFill } from "react-icons/bs";
import PopoverComponent from "./PopoverComponent";
import { useOutletContext, useParams } from "react-router-dom";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { useNewPinnedMsgIndicatorStore } from "../stores/useNewPinnedMsgIndicatorStore.js";
import { Box, Flex, Text } from "@mantine/core";
import { useGroupPinnedMessages } from "../custom-hooks/useGroupPinnedMessages.js";
import stylesPanelTop from "../css/panel_top.module.css";
import { handleSwitchPinnedMsgBox } from "../utils/pinnedMsgBox.js";

const GroupChatPanelTopIcons = ({ showOffset, handleOffsetToggle }) => {
  const { groupId } = useParams();
  const { groupChatRef } = useOutletContext();
  const { isPinnedMessagesFetched } = groupChatRef.current;
  const pinnedMsgBoxObj = useShowPinnedMsgBoxStore(
    (s) => s.pinnedMsgBoxObj.group
  );
  const switchPinnedMsgBox = useShowPinnedMsgBoxStore(
    (s) => s.switchGroupPinnedMsgBox
  );
  const newPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.newPinnedMsgExists.group
  );
  const setGroupPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.setGroupPinnedMsgExists
  );
  const { refetch } = useGroupPinnedMessages(groupId);

  return (
    <>
      <Flex align={"center"} gap={"md"} ms={"auto"}>
        <PopoverComponent
          content={
            <Text fw={700} className="popover-content">
              Pinned Messages
            </Text>
          }
          trigger={
            <Box
              pos="relative"
              onClick={(e) =>
                handleSwitchPinnedMsgBox(
                  e,
                  pinnedMsgBoxObj,
                  groupId,
                  switchPinnedMsgBox,
                  setGroupPinnedMsgExists,
                  isPinnedMessagesFetched,
                  refetch
                )
              }
              style={{
                lineHeight: 0,
              }}
            >
              <RxDrawingPin
                id="drawingPin"
                className={`${
                  pinnedMsgBoxObj[groupId] && stylesPanelTop["active"]
                } ${stylesPanelTop["panel-top-icon"]}`}
                style={{ marginLeft: "auto", fontSize: "1.25rem" }} // fs-5
              />

              {newPinnedMsgExists[groupId] && (
                <Box
                  pos="absolute"
                  style={{
                    border: "1px solid black",
                    backgroundColor: "red",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    transform: "translate(10px, -10px)",
                  }}
                />
              )}
            </Box>
          }
          position="bottom"
        />
        {/* Maybe a mute notificiation icon here */}
        <PopoverComponent
          content={
            <Text fw={700} className="popover-content">
              {showOffset ? "Hide" : "Show"} Members
            </Text>
          }
          trigger={
            <BsPersonLinesFill
              className={`${showOffset && stylesPanelTop["active"]} ${
                stylesPanelTop["panel-top-icon"]
              }`}
              style={{ marginRight: "0.25rem", fontSize: "1.25rem" }} // me-1 fs-5
              onClick={handleOffsetToggle}
            />
          }
          position="bottom"
        />
      </Flex>
    </>
  );
};

export default GroupChatPanelTopIcons;
