import React, { useContext, useEffect, useRef, useState } from "react";
import PinnedMsgsBox from "./PinnedMsgsBox";
import { useOutletContext, useParams } from "react-router-dom";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Box, Flex, Modal, Button, Image, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { socket } from "../socket.js";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  addSentFriendRequest,
  removeReceivedFriendRequest,
} from "../utils/friendRequests.js";
import { useFriendRequests } from "../custom-hooks/useFriendRequests.js";
import { addFriends, removeFriend } from "../utils/friends.js";
import { useAllFriends } from "../custom-hooks/useAllFriends.js";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import UserStatus from "../components/UserStatus.jsx";
import DmPanelTopIcons from "./DmPanelTopIcons.jsx";
import stylesPanelTop from "../css/dm_panel_top.module.css";

const DmPanelTop = ({ showOffset, handleOffsetToggle }) => {
  const { chatId } = useParams();
  const queryClient = useQueryClient();
  const { data: allFriendsData } = useAllFriends();
  const { data: friendRequests } = useFriendRequests();
  const { dmChatRef } = useOutletContext();
  const { receiverId } = useContext(DmPanelContext);
  const [
    isFriendModalOpened,
    { open: openFriendModal, close: closeFriendModal },
  ] = useDisclosure(false);
  const customOverlayRef = useRef();
  const pinnedMsgsBoxRef = useRef(null);

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
    const recevierBlockedMe = receivers[receiverId].blockedBy === "receiver";

    if (recevierBlockedMe) {
      toast.error("Something went wrong, im blocked");
      return;
    }

    socket.emit("send friend requests", receiverId, (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        toast.error(res.error);
        return;
      }
      console.log("send friend req ack", res);

      addSentFriendRequest(queryClient, [
        { id: receiverId, username: receiver.username },
      ]);
      unblockReceiver(receiverId);
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

      unblockReceiver(receiverId);
    });
  };

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
      <Box
        className={stylesPanelTop["custom-overlay"]}
        ref={customOverlayRef}
      ></Box>
      <Box className={"panel-top"}>
        <Flex h={"100%"} w={"100%"} c={"white"} pr={10} pl={10}>
          <Flex align={"center"} gap={"md"}>
            <Box
              style={{
                position: "relative",
              }}
            >
              <Image src="https://placehold.co/25" radius={"xl"} alt="" />
              {receiver?.status && (
                <UserStatus
                  status={receiver.status}
                  w={10}
                  h={10}
                  absolute={true}
                />
              )}
            </Box>
            <Title order={6}>{receiver?.display_name}</Title>
          </Flex>
          <DmPanelTopIcons
            showOffset={showOffset}
            handleOffsetToggle={handleOffsetToggle}
            openFriendModal={openFriendModal}
            isFriendModalOpened={isFriendModalOpened}
          />
        </Flex>
        <PinnedMsgsBox
          customOverlayRef={customOverlayRef}
          ref={pinnedMsgsBoxRef}
        />
      </Box>
      <Modal
        opened={isFriendModalOpened}
        onClose={closeFriendModal}
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
