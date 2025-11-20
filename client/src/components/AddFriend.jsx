import { Box, Button, Flex, Text, TextInput } from "@mantine/core";
import { IoCompassOutline } from "react-icons/io5";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useState } from "react";
import { socket } from "../socket";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  addSentFriendRequest,
  removeReceivedFriendRequest,
} from "../utils/friendRequests";
import { useFriendRequests } from "../custom-hooks/useFriendRequests";
import { addFriends } from "../utils/friends";

const AddFriend = () => {
  const [inp, setInp] = useState("");
  const { data } = useFriendRequests();
  const { receivedFriendRequests } = data ?? {};
  const queryClient = useQueryClient();
  const sendFriendRequest = () => {
    socket.emit("send friend requests", inp, (err, res) => {
      if (err || res.status === "error") {
        toast.error(res.error);
        return;
      }

      addSentFriendRequest(queryClient, [
        { id: res.friend.id, username: res.friend.username },
      ]);
      toast.success("Friend request sent");
    });
  };
  const handleFriendRequestAcceptance = (receiver) => {
    socket.emit(
      "send friend request acceptance",
      receiver.id,
      "accepted",
      (err, res) => {
        if (err || res.status === "duplicated" || res.status === "error") {
          console.log("Message failed:", err, res.error);
          toast.error(res.error);
          return;
        }

        addFriends(queryClient, [{ ...receiver, chatId: res.chatIds[0] }]);
        removeReceivedFriendRequest(queryClient, receiver.id);
        toast.success("Friend added");
      }
    );
  };

  return (
    <>
      <Flex direction={"column"} w={"100%"} p={"sm"} gap={"xs"}>
        <Box>
          <Text fz={"h2"}>Add Friend</Text>
          <Text>You can add friends with their MyChat usernames.</Text>
          <Box
            style={{
              border: "1px solid rgba(255,255,255,25%)",
              borderWidth: "0 0 1px 0",
            }}
          >
            <TextInput
              type="text"
              my={"sm"}
              placeholder="Enter your friend's MyChat username."
              rightSection={
                <Button
                  c={inp === "" ? "rgba(255, 255, 255, 0.42)" : "white"}
                  color={inp === "" ? "blue.6" : "blue"}
                  my={"md"}
                  onClick={() => {
                    if (inp === "") return;
                    const friendRequestReceived = receivedFriendRequests.find(
                      ({ username }) => username == inp
                    );

                    friendRequestReceived
                      ? handleFriendRequestAcceptance(friendRequestReceived)
                      : sendFriendRequest();
                    setInp("");
                  }}
                >
                  Send Friend Request
                </Button>
              }
              rightSectionWidth={"auto"}
              value={inp}
              onChange={(e) =>
                setInp((prev) =>
                  e.target.value.length > 15 ? prev : e.target.value
                )
              }
            />
          </Box>
        </Box>
        <Box>
          <Text fz={"h2"}>Other Places to Make Friends</Text>
          <Text>
            Don't have a username ? Cheak out our list of groups you can join
          </Text>
        </Box>
        <Button
          color="cyan"
          variant="outline"
          w={"max-content"}
          leftSection={
            <IoCompassOutline
              style={{
                width: 24,
                height: 24,
              }}
            />
          }
          rightSection={
            <MdOutlineKeyboardArrowRight
              style={{
                width: 16,
                height: 16,
              }}
            />
          }
        >
          Explore Groups
        </Button>
      </Flex>
    </>
  );
};

export default AddFriend;
