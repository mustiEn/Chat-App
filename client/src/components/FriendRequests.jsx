import React from "react";
import FriendRequestsTop from "./FriendRequestsTop";
import { Box, Flex, Image, Stack, Text } from "@mantine/core";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { socket } from "../socket";
import { friendRequestsQuery } from "../loaders";

const FriendRequests = () => {
  const friendRequests = useMsgRequestStore((state) => state.friendRequests);
  const addReceivedRequest = useMsgRequestStore(
    (state) => state.addReceivedRequest
  );
  const removeReceivedRequest = useMsgRequestStore(
    (state) => state.removeReceivedRequest
  );

  const handleMessageRequestAcceptance = (status, msg) => {
    console.log(msg);

    const emitData = {
      reqMsg: msg,
      status,
    };
    const handleEmitCallback = (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        console.log("Message failed:", err, res.error);
        return;
      }

      removeReceivedRequest(msg.from_id);
      socket.auth.serverOffset[msg.from_id] = msg.id;

      console.log("Message succesfull: ", res);
    };

    socket.emit("send msg request acceptance", {}, emitData, (err, res) =>
      handleEmitCallback(err, res)
    );
  };
  const { data, error, isError, isLoading, isSuccess } = useQuery(
    friendRequestsQuery()
  );

  useEffect(() => {
    if (friendRequests.receivedRequests.length) return;
    if (!isSuccess) return;
    if (!data.length) return;

    addReceivedRequest(data);
  }, [data]);

  return (
    <>
      <FriendRequestsTop />
      <Box p={"sm"}>
        <Text mb={"sm"} fw={"lighter"}>
          Message Requests
        </Text>
        {isLoading ? (
          <div>Loading...</div>
        ) : !friendRequests.receivedRequests?.length ? (
          <div>No data</div>
        ) : (
          <Stack gap={0}>
            {friendRequests.receivedRequests.map((msg) => (
              <Flex
                className={styles["msg-request"]}
                align={"center"}
                gap={"xs"}
                p={7}
                key={msg.id}
              >
                <Image
                  src={msg.profile ?? "https://placehold.co/40"}
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
                      {msg.display_name}
                    </Text>
                    <span className={`timestamp text-muted`}>
                      {formatDate(msg.created_at)}
                    </span>
                  </Flex>

                  <Text className={`message-content`} c={"white"}>
                    {msg.message}
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
                  <IoCheckmarkOutline className={styles.icon} />
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
        )}
      </Box>
    </>
  );
};

export default FriendRequests;
