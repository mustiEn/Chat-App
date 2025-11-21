import React, { useContext, useEffect, useRef, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Form from "react-bootstrap/Form";
import { RxCross2, RxDrawingPin } from "react-icons/rx";
import { FaUserFriends } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import PinnedMsgsBox from "./PinnedMsgsBox";
import PopoverComponent from "./PopoverComponent";
import { useOutletContext, useParams } from "react-router-dom";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { useNewPinnedMsgIndicatorStore } from "../stores/useNewPinnedMsgIndicatorStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Box, Flex, Modal, Button, Image, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { socket } from "../socket.js";
import toast from "react-hot-toast";
import stylesPanelTop from "../css/dm_panel_top.module.css";
import styles from "../css/dm_panel.module.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePinnedMessages } from "../custom-hooks/usePinnedMessages.js";
import {
  addSentFriendRequest,
  removeReceivedFriendRequest,
} from "../utils/friendRequests.js";
import { useFriendRequests } from "../custom-hooks/useFriendRequests.js";
import { addFriends, removeFriend } from "../utils/friends.js";
import { useAllFriends } from "../custom-hooks/useAllFriends.js";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import {} from "module";

const DmPanelTop = ({ handleOffsetToggle, showOffset }) => {
  const { chatId } = useParams();
  const queryClient = useQueryClient();
  const { data: allFriendsData } = useAllFriends();
  const { data: friendRequests } = useFriendRequests();
  const { dmChatRef } = useOutletContext();
  const { receiverId } = useContext(DmPanelContext);
  const { isPinnedMessagesFetched } = dmChatRef.current;
  const [opened, { open, close }] = useDisclosure(false);
  const customOverlayRef = useRef();
  const pinnedMsgsBoxRef = useRef(null);
  const [search, setSearch] = useState("");

  const allFriends =
    allFriendsData?.pages.flatMap(({ friends }) => friends) ?? [];
  const receivers = useReceiverStore((s) => s.receivers);
  const unblockReceiver = useReceiverStore((s) => s.unblockReceiver);
  const receiver = receivers[receiverId];
  const { sentFriendRequests = [], receivedFriendRequests = [] } =
    friendRequests ?? {};

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
  const isFriendRequestSent = sentFriendRequests.some(
    (e) => e.id == receiverId
  );
  const isFriendRequestReceived = receivedFriendRequests.some(
    (e) => e.id == receiverId
  );

  const handleRemoveFriend = () => {
    socket.emit("send removed friends", receiverId, (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        toast.error(res.error);
        return;
      }

      removeFriend(queryClient, receiverId);
      toast.success("Friend removed");
    });
  };
  const handleSendFriendRequest = () => {
    socket.emit("send friend requests", receiverId, (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        toast.error(res.error);
        return;
      }

      addSentFriendRequest(queryClient, [
        { id: receiverId, username: receiver.username },
      ]);
      toast.success("Friend request sent");
    });
  };
  const handleMessageRequestAcceptance = (status) => {
    socket.emit(
      "send friend request acceptance",
      receiverId,
      status,
      (err, res) => {
        if (err || res.status === "duplicated" || res.status === "error") {
          console.log("Message failed:", err, res.error);
          toast.error(res.error);
          return;
        }

        if (status === "accepted") {
          addFriends(queryClient, [{ ...receiver, chatId }]);
          toast.success("Friend request accepted");
        }

        removeReceivedFriendRequest(queryClient, receiverId);
      }
    );
  };
  const handleUnblockUser = () => {
    const isUserBlocked = receiver.isBlocked;

    if (!isUserBlocked) return;

    socket.emit("send unblocked users", receiverId, (err, res) => {
      if (err || res.status === "error") {
        console.log(res);

        toast.error(res.error);
        return;
      }

      unblockReceiver(queryClient, receiverId);
    });
  };

  const { refetch } = usePinnedMessages(chatId);

  useEffect(() => {
    if (showPinnedMsgBox[chatId])
      customOverlayRef.current.style.display = "block";

    const closePinnedMsgsBox = (event) => {
      const isTargetOverlay = event.target.classList.contains(
        customOverlayRef.current.className
      );

      if (!isTargetOverlay) return;

      customOverlayRef.current.style.display = "none";
      addToShowPinnedMsgBox(chatId, false);
    };

    document.addEventListener("click", closePinnedMsgsBox);

    return () => {
      document.removeEventListener("click", closePinnedMsgsBox);
    };
  }, [showPinnedMsgBox]);

  return (
    <>
      <div
        className={stylesPanelTop["custom-overlay"]}
        ref={customOverlayRef}
      ></div>
      <Box className={"panel-top"}>
        <Flex h={"100%"} w={"100%"} c={"white"} pr={10} pl={10}>
          <div className="d-flex align-items-center gap-2">
            <img src="https://placehold.co/25" alt="" />
            <div className="fs-6">{receiver?.display_name}</div>
          </div>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <PopoverComponent
              content={
                <div className="fw-bold popover-content">Pinned Messages</div>
              }
              trigger={
                <div
                  className="position-relative"
                  onClick={(e) => {
                    if (!showPinnedMsgBox[chatId]) e.stopPropagation();

                    addToShowPinnedMsgBox(chatId, true);
                    addToNewPinnedMsgExists(chatId, false);

                    if (!isPinnedMessagesFetched[chatId]) {
                      isPinnedMessagesFetched[chatId] = true;
                      refetch();
                    }
                  }}
                >
                  <RxDrawingPin
                    id="drawingPin"
                    className={`ms-auto fs-5 ${
                      showPinnedMsgBox[chatId] && stylesPanelTop["active"]
                    } ${stylesPanelTop["dm-panel-top-icon"]}`}
                  />
                  {newPinnedMsgExists[chatId] && (
                    <div
                      className="position-absolute rounded-circle"
                      style={{
                        border: "1px solid black",
                        backgroundColor: "red",
                        width: 10,
                        height: 10,
                        transform: "translate(10px, -10px)",
                      }}
                    ></div>
                  )}
                </div>
              }
              position="bottom"
            />
            <PopoverComponent
              content={
                <div className="fw-bold popover-content">
                  {showOffset ? "Hide" : "Show"} User Profile
                </div>
              }
              trigger={
                <CgProfile
                  className={`me-1 fs-5 ${
                    showOffset && stylesPanelTop["active"]
                  } ${stylesPanelTop["dm-panel-top-icon"]}`}
                  onClick={handleOffsetToggle}
                />
              }
              position="bottom"
            />
            {!receiver?.isBlocked ? (
              <PopoverComponent
                content={
                  <div className="fw-bold popover-content">
                    {isFriend ? "Remove Friend" : "Add friend"}
                  </div>
                }
                trigger={
                  <FaUserFriends
                    className={`me-1 fs-5 ${stylesPanelTop["active"]} ${stylesPanelTop["dm-panel-top-icon"]}`}
                    onClick={open}
                  />
                }
                position="bottom"
              />
            ) : receiver?.blockedBy === "me" ? (
              <PopoverComponent
                content={
                  <div className="fw-bold popover-content">
                    {isFriend ? "Remove Friend" : "Add friend"}
                  </div>
                }
                trigger={
                  <FaUserFriends
                    className={`me-1 fs-5 ${stylesPanelTop["active"]} ${stylesPanelTop["dm-panel-top-icon"]}`}
                    onClick={open}
                  />
                }
                position="bottom"
              />
            ) : (
              ""
            )}

            <div className="position-relative">
              <Form.Control
                type="search"
                size="sm"
                data-bs-theme="dark"
                placeholder="Search"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <HiMagnifyingGlass
                className={
                  search != ""
                    ? "d-none"
                    : "position-absolute top-50 end-0 translate-middle-y me-3"
                }
              />
              <RxCross2
                id={`${styles["cross"]}`}
                className={
                  search == ""
                    ? "d-none"
                    : "position-absolute top-50 end-0 translate-middle-y me-3"
                }
                onClick={() => setSearch("")}
              />
            </div>
          </div>
        </Flex>
        <PinnedMsgsBox
          customOverlayRef={customOverlayRef}
          ref={pinnedMsgsBoxRef}
        />
      </Box>
      <Modal
        opened={opened}
        onClose={close}
        radius={"md"}
        title={isFriend ? "Remove Friend" : "Add Friend"}
        styles={{
          title: {
            fontSize: "var(--mantine-h3-font-size)",
            fontWeight: "600",
          },
          header: {
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderWidth: "0 0 1px 0",
          },
        }}
        centered
      >
        <Text my={"xs"}>
          {isFriendRequestReceived
            ? "Looks like somebody wants to be friends..."
            : isFriendRequestSent
            ? "It shouldn't take too long..."
            : `You sure you want to
          ${
            isFriend
              ? " remove this user from your friends"
              : " send friend request to this user"
          }`}
        </Text>
        <Flex
          direction={"column"}
          align={"center"}
          gap={"xs"}
          p={"xs"}
          // bd={"1px solid #1b1b1d"}
          // bdrs={"md"}
        >
          <Image
            src={receiver?.profile ?? "https://placehold.co/80"}
            w={80}
            h={80}
            radius={"100%"}
          />
          <Text fw={"bold"} fz={"h3"}>
            {receiver?.display_name}
          </Text>
          <Text>{receiver?.username}</Text>
        </Flex>
        <Flex gap={"xs"}>
          <Button
            mt={"sm"}
            ml={"auto"}
            variant={"filled"}
            color={isFriend ? "red" : "blue"}
            onClick={() => {
              if (isFriendRequestSent) {
                return;
              } else if (isFriendRequestReceived) {
                handleMessageRequestAcceptance("accepted");
                return;
              }
              if (isFriend) {
                handleRemoveFriend();
              } else {
                handleSendFriendRequest();
                handleUnblockUser();
              }
            }}
            disabled={isFriendRequestSent}
          >
            {isFriendRequestReceived
              ? "Accept"
              : isFriendRequestSent
              ? "Friend request sent"
              : isFriend
              ? "Remove friend"
              : "Send friend request"}
          </Button>
          {isFriendRequestReceived && (
            <Button
              mt={"sm"}
              variant={"filled"}
              color={"red"}
              onClick={() => handleMessageRequestAcceptance("rejected")}
            >
              Cancel
            </Button>
          )}
        </Flex>
      </Modal>
    </>
  );
};

export default DmPanelTop;
