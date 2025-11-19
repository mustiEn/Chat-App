import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "../utils/index.js";
import { socket } from "../socket";
import { IoCheckmarkOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import MessageRequestsTop from "./MessageRequestsTop.jsx";
import { Box, Flex, Text, Button, Stack, Image } from "@mantine/core";
import styles from "../css/message_requests.module.css";
import { useMessageRequests } from "../custom-hooks/useMessageRequests.js";
import { removeReceivedMessageRequest } from "../utils/msgRequests.js";
import { toast } from "react-hot-toast";

const MessageRequests = () => {
  const queryClient = useQueryClient();

  const handleMessageRequestAcceptance = (status, msg) => {
    const emitData = {
      reqMsg: msg,
      status,
    };
    const handleEmitCallback = (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        console.log("Message failed:", err, res.error);
        toast.error(res.error);
        return;
      }

      removeReceivedMessageRequest(queryClient, msg.from_id);
      // socket.auth.serverOffset[msg.from_id] = msg.id;
      toast.success(`Message request ${status}`);
    };

    socket.emit("send msg request acceptance", {}, emitData, (err, res) =>
      handleEmitCallback(err, res)
    );
  };
  const { data, isLoading } = useMessageRequests();
  const { receivedMessageRequests = [] } = data ?? {};

  return (
    <>
      <MessageRequestsTop />
      <Box p={"sm"}>
        <Text mb={"sm"} fw={"lighter"}>
          Message Requests
        </Text>
        {isLoading ? (
          <div>Loading...</div>
        ) : !receivedMessageRequests.length ? (
          <div>No data</div>
        ) : (
          <Stack gap={0}>
            {receivedMessageRequests.map((msg) => (
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

export default MessageRequests;
