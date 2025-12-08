import React from "react";
import { TbDotsVertical, TbMessageCircle } from "react-icons/tb";
import { Box, Flex, Image, Stack, Text } from "@mantine/core";
import { useAllFriends } from "../custom-hooks/useAllFriends";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { RxCross1 } from "react-icons/rx";
import PopoverComponent from "./PopoverComponent";
import styles from "../css/all_friends.module.css";
import UserStatus from "./UserStatus";
import { useReceiverStore } from "../stores/useReceiverStore";
import { FaRegComment } from "react-icons/fa";
import { useMemo } from "react";

const OnlineFriends = () => {
  const { data } = useAllFriends();
  const allFriends = data?.pages.flatMap(({ friends }) => friends) ?? [];
  const receivers = useReceiverStore((s) => s.receivers);
  const onlineFriends = useMemo(
    () =>
      allFriends.filter((friend) => receivers[friend.id]?.status === "Online"),
    [receivers, allFriends]
  );
  const parentRef = useRef();
  const rowVirtualizer = useVirtualizer({
    count: onlineFriends.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });
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
  return (
    <>
      <Box p={"sm"}>
        <Text mx={"xs"} pb={"xs"}>
          Online Friends - {onlineFriends.length}
        </Text>
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
              const friend = onlineFriends[virtualRow.index];

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
                      {friend?.status && (
                        <UserStatus
                          status={"Online"}
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
        </Box>
      </Box>
    </>
  );
};

export default OnlineFriends;
