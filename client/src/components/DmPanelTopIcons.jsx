import React, { useContext, useRef, useState } from "react";
import { RxDrawingPin } from "react-icons/rx";
import { FaUserFriends } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import PopoverComponent from "./PopoverComponent";
import { useOutletContext, useParams } from "react-router-dom";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { useNewPinnedMsgIndicatorStore } from "../stores/useNewPinnedMsgIndicatorStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Box, Flex, Text } from "@mantine/core";
import { useDmPinnedMessages } from "../custom-hooks/useDmPinnedMessages.js";
import { useAllFriends } from "../custom-hooks/useAllFriends.js";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import stylesPanelTop from "../css/panel_top.module.css";
import { handleSwitchPinnedMsgBox } from "../utils/pinnedMsgBox.js";

const DmPanelTopIcons = ({
  showOffset,
  handleOffsetToggle,
  openFriendModal,
  isFriendModalOpened,
}) => {
  const { chatId } = useParams();
  const { data: allFriendsData } = useAllFriends();
  const { dmChatRef } = useOutletContext();
  const { receiverId } = useContext(DmPanelContext);
  const { isPinnedMessagesFetched } = dmChatRef.current;
  const { refetch } = useDmPinnedMessages(chatId);
  const allFriends =
    allFriendsData?.pages.flatMap(({ friends }) => friends) ?? [];
  const receivers = useReceiverStore((s) => s.receivers);
  const receiver = receivers[receiverId];

  const pinnedMsgBoxObj = useShowPinnedMsgBoxStore((s) => s.pinnedMsgBoxObj.dm);
  const switchPinnedMsgBox = useShowPinnedMsgBoxStore(
    (s) => s.switchDmPinnedMsgBox
  );
  const newPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.newPinnedMsgExists.dm
  );
  const setDmPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.setDmPinnedMsgExists
  );
  const isFriend = allFriends.some((e) => e.id == receiverId);

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
                  chatId,
                  switchPinnedMsgBox,
                  setDmPinnedMsgExists,
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
                  pinnedMsgBoxObj[chatId] && stylesPanelTop["active"]
                } ${stylesPanelTop["panel-top-icon"]}`}
                style={{ marginLeft: "auto", fontSize: "1.25rem" }} // fs-5
              />

              {newPinnedMsgExists[chatId] && (
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

        <PopoverComponent
          content={
            <Text fw={700} className="popover-content">
              {showOffset ? "Hide" : "Show"} User Profile
            </Text>
          }
          trigger={
            <CgProfile
              className={`${showOffset && stylesPanelTop["active"]} ${
                stylesPanelTop["panel-top-icon"]
              }`}
              style={{ marginRight: "0.25rem", fontSize: "1.25rem" }} // me-1 fs-5
              onClick={handleOffsetToggle}
            />
          }
          position="bottom"
        />

        {(!receiver?.isBlocked || receiver?.blockedBy === "me") && (
          <PopoverComponent
            content={
              <Text fw={700} className="popover-content">
                {isFriend ? "Remove Friend" : "Add friend"}
              </Text>
            }
            trigger={
              <FaUserFriends
                className={`${
                  isFriendModalOpened && stylesPanelTop["active"]
                } ${stylesPanelTop["panel-top-icon"]}`}
                style={{ marginRight: "0.25rem", fontSize: "1.25rem" }} // me-1 fs-5
                onClick={openFriendModal}
              />
            }
            position="bottom"
          />
        )}
      </Flex>
    </>
  );
};

export default DmPanelTopIcons;
