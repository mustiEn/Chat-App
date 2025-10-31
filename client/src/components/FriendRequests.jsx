import React from "react";
import FriendRequestsTop from "./FriendRequestsTop";
import { Box, Flex, Image, Stack, Text } from "@mantine/core";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { socket } from "../socket";
import { friendRequestsQuery } from "../loaders";
import { RxCross1 } from "react-icons/rx";
import PopoverComponent from "./PopoverComponent";
import { PulseLoader } from "react-spinners";
import { FaRegComment } from "react-icons/fa";
import { useFriendRequestStore } from "../stores/useFriendRequestStore";
import { useFriendStore } from "../stores/useFriendStore";
import styles from "../css/friend_requests.module.css";
import { IoCheckmarkOutline } from "react-icons/io5";

const FriendRequests = () => {
  const addToFriends = useFriendStore((s) => s.addToFriends);
  const receivedFriendRequests = useFriendRequestStore(
    (s) => s.friendRequests.receivedRequests
  );
  const addReceivedRequest = useFriendRequestStore((s) => s.addReceivedRequest);
  const addSentRequest = useFriendRequestStore((s) => s.addSentRequest);
  const removeReceivedRequest = useFriendRequestStore(
    (s) => s.removeReceivedRequest
  );

  const handleMessageRequestAcceptance = (friend, status) => {
    socket.emit(
      "send friend request acceptance",
      friend.id,
      status,
      (err, res) => {
        if (err || res.status === "duplicated" || res.status === "error") {
          console.log("Message failed:", err, res.error);
          return;
        }

        if (status === "accepted") addToFriends(friend);

        removeReceivedRequest(friend.id);
      }
    );
  };

  const { data, error, isError, isLoading, isSuccess } = useQuery(
    friendRequestsQuery()
  );

  useEffect(() => {
    if (receivedFriendRequests.length) return;
    if (!isSuccess) return;
    if (!data) return;

    const {
      receivedFriendRequests: recevied,
      sentFriendRequests: [sent],
    } = data;

    addReceivedRequest(recevied);
    addSentRequest(sent);
  }, [data]);

  return (
    <>
      {/* <FriendRequestsTop /> */}
      <Flex direction={"column"} p={"sm"} h={"100%"}>
        <Text c={"white"} mb={"md"} fw={"lighter"}>
          Received - {receivedFriendRequests.length}
        </Text>

        {isLoading ? (
          <div>Loading...</div>
        ) : !receivedFriendRequests.length ? (
          <div>No data</div>
        ) : (
          <>
            <Box
              className="custom-scrollbar"
              h={300}
              style={{
                overflow: "auto",
                flex: "1 0 auto",
              }}
            >
              <Stack gap={0}>
                {receivedFriendRequests.map((friend, i) => (
                  <Flex
                    className={styles.friend}
                    align={"center"}
                    gap={"xs"}
                    p={7}
                    key={friend.id}
                  >
                    <Image
                      src={friend.profile ?? "https://placehold.co/40"}
                      radius={"xl"}
                      w={40}
                      h={40}
                      style={{
                        alignSelf: "baseline",
                      }}
                    />
                    <Flex direction={"column"} w={"100%"}>
                      <Flex align={"center"} gap={"xs"}>
                        <Text c={"white"} fw={"bold"}>
                          {friend.display_name}
                        </Text>
                        <span className={styles.username}>
                          {friend.username}
                        </span>
                      </Flex>
                    </Flex>
                    <PopoverComponent
                      content={"Accept"}
                      trigger={
                        <Flex
                          className={[styles.btn, styles.accept].join(" ")}
                          align={"center"}
                          justify={"center"}
                          w={50}
                          h={50}
                          bdrs={"xl"}
                          ms={"auto"}
                          onClick={() =>
                            handleMessageRequestAcceptance("accepted", friend)
                          }
                        >
                          <IoCheckmarkOutline className={styles.icon} />
                        </Flex>
                      }
                      position={"top"}
                    />
                    <PopoverComponent
                      content={"Reject"}
                      trigger={
                        <Flex
                          className={[styles.btn, styles.reject].join(" ")}
                          w={50}
                          h={50}
                          align={"center"}
                          justify={"center"}
                          bdrs={"xl"}
                          onClick={() =>
                            handleMessageRequestAcceptance("rejected", friend)
                          }
                        >
                          <RxCross1 className={styles.icon} />
                        </Flex>
                      }
                      position={"top"}
                    />
                  </Flex>
                ))}
              </Stack>
              {data.pages && hasNextPage && (
                <Box mt={"xl"} ref={ref}>
                  <PulseLoader color={"white"} />
                </Box>
              )}
            </Box>
          </>
        )}
      </Flex>
    </>
  );
};

export default FriendRequests;
