import React, { useContext, useEffect } from "react";
import { LuDot } from "react-icons/lu";
import { useParams } from "react-router-dom";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Box, Button, Flex, Image, Text } from "@mantine/core";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import { socket } from "../socket.js";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { removeFriend } from "../utils/friends.js";

const DmHeadProfile = () => {
  const { chatId } = useParams();
  const { receiverId } = useContext(DmPanelContext);
  const receivers = useReceiverStore((s) => s.receivers);
  const receiver = receivers[receiverId];
  const blockReceiver = useReceiverStore((s) => s.blockReceiver);
  const unblockReceiver = useReceiverStore((s) => s.unblockReceiver);
  const queryClient = useQueryClient();

  const handleBlockUser = () => {
    const allFriendsQuery = queryClient.getQueryData(["allFriends"]);
    const allFriends = allFriendsQuery
      ? allFriendsQuery.pages.flatMap(({ friends }) => friends)
      : [];
    const isFriend = allFriends.some(({ id }) => id == id);

    socket.emit("send blocked users", receiverId, chatId, (err, res) => {
      if (err || res.status === "error") {
        console.log(res);

        toast.error(res.error);
        return;
      }

      blockReceiver(receiverId, "me");
      if (isFriend) removeFriend(queryClient, receiverId);
      toast.success("User blocked");
    });
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
    console.log(receiver, receiver.blockedBy);
  }, [receiver]);
  return (
    <>
      <Box m={"xs"}>
        <Image
          src={receiver?.profile ? receiver.profile : "https://placehold.co/80"}
          radius={"100%"}
          w={80}
          h={80}
          alt=""
        />
        <Text
          style={{
            fontSize: 24,
          }}
        >
          {receiver?.display_name}
        </Text>
        <Text
          style={{
            fontSize: 20,
          }}
        >
          {receiver?.username}
        </Text>
        <Flex align={"center"} gap={"xs"}>
          <Text>No Mutual Groups</Text>
          {receiver?.blockedBy === "receiver" ? (
            ""
          ) : (
            <>
              <LuDot />
              <Button
                color="dark"
                size="sm"
                onClick={() =>
                  receiver.isBlocked ? handleUnblockUser() : handleBlockUser()
                }
              >
                {receiver.isBlocked ? "Unblock" : "Block"}
              </Button>
            </>
          )}
        </Flex>
      </Box>
    </>
  );
};

export default DmHeadProfile;
