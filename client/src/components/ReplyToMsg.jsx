import React from "react";
import { RxCrossCircled } from "react-icons/rx";
import styles from "../css/reply_to_msg.module.css";
import { useMsgToReplyStore } from "../stores/useMsgToReplyStore.js";
import { Box, Flex, Text } from "@mantine/core";

const ReplyToMsg = ({ toWho }) => {
  const setMsgToReply = useMsgToReplyStore((s) => s.setMsgToReply);

  return (
    <Flex
      id={`${styles["replyToMsg"]}`}
      justify={"space-between"}
      align={"center"}
      w={"100%"}
      mt={"xs"}
      px={"xs"}
      bd={"1px solid gray"}
      style={{
        borderWidth: "1px 1px 0 1px",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
      }}
    >
      <Box c="white">
        Replying to{" "}
        <span
          style={{
            fontWeight: "bold",
          }}
        >
          {toWho}
        </span>
      </Box>
      <RxCrossCircled
        className={`${styles["icon"]}`}
        onClick={() => setMsgToReply(null)}
      />
    </Flex>
  );
};

export default ReplyToMsg;
