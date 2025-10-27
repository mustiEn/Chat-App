import React from "react";
import { Box, Flex, Image, Text } from "@mantine/core";
import styles from "../css/msg_replied_div.module.css";

const MsgRepliedDiv = ({ msg }) => {
  return (
    <>
      <Flex align={"flex-end"} className={`${styles["msg-replied"]}`}>
        <Box className={styles.line}></Box>
        <Flex
          align={"center"}
          w={"100%"}
          gap={"xs"}
          className={`${styles["msg-replied-content"]}`}
        >
          <Image
            src={msg.replied_msg_profile ?? "https://placehold.co/16"}
            radius={"xl"}
            w={16}
            h={16}
            alt=""
          />
          <Text fs={"italic"} className="text-muted">
            {msg.replied_msg_sender}
          </Text>
          <Text className={`${styles["msg-replied-message"]}`}>
            {msg.is_replied_msg_deleted
              ? "This message was deleted"
              : msg.replied_msg_message}
            {/* tabindex="-1" aria-hidden="true" style='min-height: 0px !important;
            max-height: none !important; height: 0px !important; visibility:
            hidden !important; overflow: hidden !important; position: absolute
            !important; z-index: -1000 !important; top: 0px !important; right:
            0px !important; display: block !important; border-width: 0px;
            box-sizing: border-box; font-family: system-ui, -apple-system,
            "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation
            Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
            "Segoe UI Symbol", "Noto Color Emoji"; font-size: 16px; font-style:
            normal; font-weight: 400; letter-spacing: normal; line-height: 24px;
            padding: 0px; tab-size: 8; text-indent: 0px; text-rendering: auto;
            text-transform: none; width: 741.688px; word-" */}
          </Text>
        </Flex>
      </Flex>
    </>
  );
};

export default MsgRepliedDiv;
