import React from "react";
import FriendRequestsTop from "./FriendRequestsTop";
import { Box, Flex, Image, Stack, Text } from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socket } from "../socket";
import { RxCross1 } from "react-icons/rx";
import PopoverComponent from "./PopoverComponent";
import styles from "../css/friend_requests.module.css";
import { IoCheckmarkOutline } from "react-icons/io5";
import { useFriendRequests } from "../custom-hooks/useFriendRequests";
import { removeReceivedFriendRequest } from "../utils/friendRequests";
import { addFriends } from "../utils/friends";

const FriendRequests = () => {
  const queryClient = useQueryClient();

  const handleMessageRequestAcceptance = (status, friend) => {
    socket.emit(
      "send friend request acceptance",
      friend.id,
      status,
      (err, res) => {
        if (err || res.status === "duplicated" || res.status === "error") {
          console.log("Message failed:", err, res.error);
          return;
        }
        console.log(friend);

        if (status === "accepted") addFriends(queryClient, [friend]);

        removeReceivedFriendRequest(queryClient, friend.id);
      }
    );
  };

  const { data, isLoading } = useFriendRequests();
  const { receivedFriendRequests = [] } = data ?? {};

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
              {/* {data.pages && hasNextPage && (
                <Box mt={"xl"} ref={ref}>
                  <PulseLoader color={"white"} />
                </Box>
              )} */}
            </Box>
          </>
        )}
      </Flex>
    </>
  );
};

export default FriendRequests;
