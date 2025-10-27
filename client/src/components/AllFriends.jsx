import React from "react";
import { FaRegComment } from "react-icons/fa";
import { Box, Flex, Image, Stack, Text } from "@mantine/core";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import { PulseLoader } from "react-spinners";

import styles from "../css/all_friends.module.css";

const AllFriends = () => {
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

  const allFriends = data?.pages.flatMap((e) => e.friends) ?? [];

  useEffect(() => {
    if (inView) {
      console.log("fetched");

      // fetchNextPage();
    }
  }, [inView]);

  return (
    <>
      <Box p={"sm"}>
        <Text c={"white"} mb={"sm"} fw={"lighter"}>
          AllFriends - {allFriends.length}
        </Text>

        {isLoading ? (
          <div>Loading...</div>
        ) : !allFriends.length ? (
          <div>No data</div>
        ) : (
          <>
            <Stack gap={0}>
              {allFriends.map((friend) => (
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
                      <span className={styles.username}>{friend.username}</span>
                    </Flex>

                    <Text fz={13} c={"gray.6"}>
                      Online
                      {/* {friend.status} */}
                    </Text>
                  </Flex>
                  <Flex
                    className={[styles.btn, styles.accept].join(" ")}
                    align={"center"}
                    justify={"center"}
                    w={50}
                    h={50}
                    bdrs={"xl"}
                    ms={"auto"}
                    onClick={() =>
                      handleMessageRequestAcceptance("accepted", msg)
                    }
                  >
                    <FaRegComment className={styles.icon} />
                  </Flex>
                  <Flex
                    className={[styles.btn, styles.reject].join(" ")}
                    w={50}
                    h={50}
                    align={"center"}
                    justify={"center"}
                    bdrs={"xl"}
                    onClick={() =>
                      handleMessageRequestAcceptance("rejected", msg)
                    }
                  >
                    <RxCross1 className={styles.icon} />
                  </Flex>
                </Flex>
              ))}
            </Stack>
            {data.pages && hasNextPage && (
              <Box mt={"xl"} ref={ref}>
                <PulseLoader color={"white"} />
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );
};

export default AllFriends;
