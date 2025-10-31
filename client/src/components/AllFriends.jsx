import React, { useRef } from "react";
import { FaRegComment } from "react-icons/fa";
import { Box, Flex, Image, Stack, Text } from "@mantine/core";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import { PulseLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";
import PopoverComponent from "./PopoverComponent";
import { useFriendStore } from "../stores/useFriendStore.js";
import { useFriendRequestStore } from "../stores/useFriendRequestStore.js";
import { friendRequestsQuery } from "../loaders/index.js";
import { useVirtualizer } from "@tanstack/react-virtual";
import styles from "../css/all_friends.module.css";

const AllFriends = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { inView, ref } = useInView({
    threshold: 0.4,
  });
  const parentRef = useRef();

  const allFriends = useFriendStore((s) => s.friends);
  const addToFriends = useFriendStore((s) => s.addToFriends);
  const addReceivedRequest = useFriendRequestStore((s) => s.addReceivedRequest);
  const addSentRequest = useFriendRequestStore((s) => s.addSentRequest);
  const receivedFriendRequests = useFriendRequestStore(
    (s) => s.friendRequests.receivedRequests
  );

  const getAllFriends = async ({ pageParam }) => {
    try {
      // const res = await fetch(`/api/get-all-friends/${pageParam}`);
      const res = await fetch(
        `https://dummyjson.com/users?limit=20&skip=${pageParam}`
      );
      let data = await res.json();

      if (!res.ok) throw new Error(data.error);
      data.users = data.users.map((e) => ({
        ...e,
        id: e.id === 2 ? 1000 : e.id === 4 ? 200 : e.id,
        display_name: e.firstName,
        profile: e.image,
      }));
      return data;
    } catch (error) {
      toast.error(error.message);
    }
  };
  const removeFriend = (friendId, index) => {
    socket.emit("send removed friends", friendId, (err, res) => {
      if (err) {
        console.log(err.message);
        return;
      }

      const friendIndexInCache = Math.floor(index / 15);

      queryClient.setQueryData(["allFriends"], (olderData) => {
        const newPagesArr = [...olderData.pages];
        const friendsFiltered = newPagesArr[friendIndexInCache].friends.filter(
          ({ id }) => id !== friendId
        );

        newPagesArr[friendIndexInCache] = {
          ...newPagesArr[friendIndexInCache],
          friends: friendsFiltered,
        };

        return {
          ...olderData,
          pages: newPagesArr,
        };
      });

      toast.success("Friend removed");
    });
  };
  const {
    data: allFriendsData,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["allFriends"],
    queryFn: getAllFriends,
    initialPageParam: 0,
    getNextPageParam: (lastData) => {
      return lastData.skip + lastData.limit;
    },
    staleTime: Infinity,
  });
  const {
    data: friendRequestsData,
    error,
    isError,
    isSuccess,
  } = useQuery(friendRequestsQuery());

  // const allRows = allFriendsData?.pages.flatMap((e) => e.users) ?? [];

  useEffect(() => {
    if (!allFriendsData) return;

    const friendsData = allFriendsData.pages.at(-1).users.at(-1);
    const lastItemId = friendsData?.id;
    const isDataTheSame = allFriends.some(({ id }) => id === lastItemId);

    if (!lastItemId) return;
    if (isDataTheSame) return;

    addToFriends(allFriendsData.pages.at(-1).users);
  }, [allFriendsData, allFriends]);
  useEffect(() => {
    if (receivedFriendRequests.length) return;
    if (!isSuccess) return;
    if (!friendRequestsData) return;

    const { receivedFriendRequests: received, sentFriendRequests: sent } =
      friendRequestsData;
    const mappedSent = sent.map(({ id }) => id);

    addReceivedRequest(received);
    addSentRequest(mappedSent);
  }, [friendRequestsData, receivedFriendRequests]);
  // useEffect(() => {
  //   if (inView) {
  //     fetchNextPage();
  //   }
  // }, [inView]);
  const rowVirtualizer = useVirtualizer({
    count: allFriends?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

  return (
    <>
      <Flex direction={"column"} p={"sm"} h={"100%"}>
        <Text c={"white"} mb={"md"} fw={"lighter"}>
          All Friends - {allFriends.length}
        </Text>

        {isLoading ? (
          <div>Loading...</div>
        ) : !allFriends.length ? (
          <div>No data</div>
        ) : (
          <>
            <Box
              ref={parentRef}
              className="custom-scrollbar"
              style={{
                height: 730,
                width: `100%`,
                overflow: "auto",
              }}
            >
              <Box
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const friend = allFriends[virtualRow.index];

                  return (
                    <Box
                      key={virtualRow.index}
                      className={styles.friend}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <Flex align={"center"} gap={"xs"} p={7} key={friend.id}>
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

                          <Text fz={13} c={"gray.6"}>
                            Online
                            {/* {friend.status} */}
                          </Text>
                        </Flex>
                        <PopoverComponent
                          content={"Message"}
                          trigger={
                            <Flex
                              className={[styles.btn, styles.accept].join(" ")}
                              align={"center"}
                              justify={"center"}
                              w={50}
                              h={50}
                              bdrs={"xl"}
                              ms={"auto"}
                              onClick={() => navigate(`${friend.id}`)}
                            >
                              <FaRegComment className={styles.icon} />
                            </Flex>
                          }
                          position={"top"}
                        />
                        <PopoverComponent
                          content={"Remove"}
                          trigger={
                            <Flex
                              className={[styles.btn, styles.reject].join(" ")}
                              w={50}
                              h={50}
                              align={"center"}
                              justify={"center"}
                              bdrs={"xl"}
                              onClick={() => {
                                console.log(
                                  queryClient.getQueryData(["allFriends"])
                                );

                                removeFriend(friend.id, i);
                              }}
                            >
                              <RxCross1 className={styles.icon} />
                            </Flex>
                          }
                          position={"top"}
                        />
                      </Flex>
                    </Box>
                  );
                })}
              </Box>
              {hasNextPage && (
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

export default AllFriends;
