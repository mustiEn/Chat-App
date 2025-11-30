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
import { usePinnedMessages } from "../custom-hooks/usePinnedMessages.js";
import { useAllFriends } from "../custom-hooks/useAllFriends.js";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import stylesPanelTop from "../css/dm_panel_top.module.css";

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
  const allFriends =
    allFriendsData?.pages.flatMap(({ friends }) => friends) ?? [];
  const receivers = useReceiverStore((s) => s.receivers);
  const receiver = receivers[receiverId];

  const showPinnedMsgBox = useShowPinnedMsgBoxStore((s) => s.showPinnedMsgBox);
  const addToShowPinnedMsgBox = useShowPinnedMsgBoxStore(
    (s) => s.addToShowPinnedMsgBox
  );
  const newPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.newPinnedMsgExists
  );
  const addToNewPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.addToNewPinnedMsgExists
  );

  const isFriend = allFriends.some((e) => e.id == receiverId);
  const { refetch } = usePinnedMessages(chatId);

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
              onClick={(e) => {
                if (!showPinnedMsgBox[chatId]) e.stopPropagation();

                addToShowPinnedMsgBox(chatId, true);
                addToNewPinnedMsgExists(chatId, false);

                if (!isPinnedMessagesFetched[chatId]) {
                  isPinnedMessagesFetched[chatId] = true;
                  refetch();
                }
              }}
              style={{
                lineHeight: 0,
              }}
            >
              <RxDrawingPin
                id="drawingPin"
                className={`${
                  showPinnedMsgBox[chatId] && stylesPanelTop["active"]
                } ${stylesPanelTop["dm-panel-top-icon"]}`}
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
                stylesPanelTop["dm-panel-top-icon"]
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
                } ${stylesPanelTop["dm-panel-top-icon"]}`}
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
