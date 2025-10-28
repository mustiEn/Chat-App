import React from "react";
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
import styles from "../css/all_friends.module.css";
import PopoverComponent from "./PopoverComponent";
import { useFriendStore } from "../stores/useFriendStore.js";

const AllFriends = () => {
  const queryClient = useQueryClient();
  const allFriends = useFriendStore((s) => s.friends);
  const addToFriends = useFriendStore((s) => s.addToFriends);
  const navigate = useNavigate();
  const { inView, ref } = useInView({
    threshold: 1,
  });

  const getAllFriends = async ({ pageParam }) => {
    try {
      const res = await fetch(`/api/get-all-friends/${pageParam}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      toast.error(error.message);
    }
  };
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["allFriends"],
    queryFn: getAllFriends,
    initialPageParam: 0,
    getNextPageParam: (lastData) => lastData.next,
    staleTime: Infinity,
  });
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

  useEffect(() => {
    if (!data) return;

    const friendsData = data.pages.at(-1).friends;
    const lastItemId = friendsData.at(-1).id;

    if (allFriends.at(-1)?.id === lastItemId) return;

    addToFriends(friendsData);
  }, [data]);

  useEffect(() => {
    if (inView) fetchNextPage();
  }, [inView]);

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
              className="custom-scrollbar"
              h={300}
              style={{
                overflow: "auto",
                flex: "1 0 auto",
              }}
            >
              <Stack gap={0}>
                {allFriends.map((friend, i) => (
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

export default AllFriends;
