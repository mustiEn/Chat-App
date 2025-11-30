import React, { useRef } from "react";
import { FaRegComment } from "react-icons/fa";
import { Box, Flex, Image, Text } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import { PulseLoader } from "react-spinners";
import { useNavigate, useOutletContext } from "react-router-dom";
import { socket } from "../socket.js";
import PopoverComponent from "./PopoverComponent";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAllFriends } from "../custom-hooks/useAllFriends.js";
import { removeFriend } from "../utils/friends.js";
import styles from "../css/all_friends.module.css";
import UserStatus from "./UserStatus.jsx";
import { useReceiverStore } from "../stores/useReceiverStore.js";

const AllFriends = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { inView, ref } = useInView({
    threshold: 0.4,
  });
  const parentRef = useRef();
  const handleRemoveFriend = (friendId) => {
    socket.emit("send removed friends", friendId, (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        console.log(err.message);
        toast.error(res.message);
        return;
      }

      removeFriend(queryClient, friendId);
      toast.success("Friend removed");
    });
  };
  const { data, isLoading, hasNextPage, fetchNextPage, isSuccess } =
    useAllFriends();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  const newdata = data?.pages.flatMap(({ friends }) => friends) ?? [];
  const allFriends = newdata.sort((a, b) =>
    a.display_name.localeCompare(b.display_name, undefined, {
      sensitivity: "base",
    })
  );
  const rowVirtualizer = useVirtualizer({
    count: allFriends.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

  const addReceiver = useReceiverStore((s) => s.addToReceivers);
  const receivers = useReceiverStore((s) => s.receivers);

  useEffect(() => {
    if (!isSuccess) return;
    if (!data) return;

    newdata.forEach((e) => addReceiver(e.id, e));
  }, [newdata]);

  return (
    <>
      <Flex direction={"column"} p={"sm"} className={styles["all-friends-box"]}>
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
              w={"100%"}
              h={"100%"}
              className="custom-scrollbar"
              style={{
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
                        <Box pos={"relative"}>
                          <Image
                            src={friend.profile ?? "https://placehold.co/40"}
                            radius={"xl"}
                            w={40}
                            h={40}
                            style={{
                              alignSelf: "baseline",
                            }}
                          />
                          {receivers[friend.id]?.status && (
                            <UserStatus
                              status={receivers[friend.id].status}
                              w={15}
                              h={15}
                              absolute={true}
                            />
                          )}
                        </Box>
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
                            {receivers[friend.id]?.status}
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
                              onClick={() =>
                                navigate(`/@me/${friend.chatId ?? friend.id}`)
                              }
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

                                handleRemoveFriend(friend.id);
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
