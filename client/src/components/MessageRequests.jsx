import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { formatDate } from "../utils";
import { socket } from "../socket";
import { IoCheckmarkOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { useMsgRequestStore } from "../stores/useMsgRequestStore.js";
import MessageRequestsTop from "./MessageRequestsTop.jsx";
import { Box, Flex, Text, Button, Stack, Image } from "@mantine/core";
import styles from "../css/message_requests.module.css";

const MessageRequests = () => {
  const msgRequests = useMsgRequestStore((state) => state.msgRequests);
  const addToOthersRequests = useMsgRequestStore(
    (state) => state.addToOthersRequests
  );
  const removeFromOthersRequests = useMsgRequestStore(
    (state) => state.removeFromOthersRequests
  );
  const getMessageRequests = async () => {
    try {
      const res = await fetch("/api/message-requests");
      const data = await res.json();
      console.log("message - reqs");

      if (!res.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      throw new Error(error);
    }
  };
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

      removeFromOthersRequests(msg.from_id);
      socket.auth.serverOffset[msg.from_id] = msg.id;

      console.log("Message succesfull: ", res);
    };

    socket.emit("send msg request acceptance", {}, emitData, (err, res) =>
      handleEmitCallback(err, res)
    );
  };

  const { data, error, isError, isLoading, isSuccess } = useQuery({
    queryKey: ["messageRequests"],
    queryFn: getMessageRequests,
    staleTime: Infinity,
  });
  useEffect(() => {
    if (!isSuccess) return;
    if (!data.length) return;

    const anyIdAlreadyExists = msgRequests.fromOthers.some(
      ({ id }) => id == data[0].id
    );
    console.log(anyIdAlreadyExists);
    console.log(msgRequests.fromOthers.length);

    if (anyIdAlreadyExists) return;
    if (msgRequests.fromOthers.length) return;

    addToOthersRequests(data);
  }, [data]);

  return (
    <>
      <MessageRequestsTop />
      <Box p={"sm"}>
        <Text mb={"lg"} fw={"lighter"}>
          Message Requests
        </Text>
        {isLoading ? (
          <div>Loading...</div>
        ) : !msgRequests.fromOthers?.length ? (
          <div>No data</div>
        ) : (
          <Stack gap={"sm"}>
            {msgRequests.fromOthers.map((msg) => (
              <Flex
                className={styles["msg-request"]}
                align={"center"}
                gap={"xs"}
                pb={"sm"}
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

export default MessageRequests;
