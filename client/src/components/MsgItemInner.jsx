import React from "react";
import EditMsg from "./EditMsg.jsx";
import { formatDate, isURL, normaliseURL } from "../utils/index.js";
import MsgRepliedDiv from "./MsgRepliedDiv.jsx";
import { Anchor, Flex, Image, Text } from "@mantine/core";

const MsgItemInner = ({ msg = [], editedMessage, setEditedMessage }) => {
  return (
    <>
      {msg.replied_msg_sender && <MsgRepliedDiv msg={msg} />}
      <Flex align={"center"} gap={"xs"} w={"100%"}>
        <Image
          src={msg.profile ?? "https://placehold.co/40"}
          radius={"xl"}
          w={40}
          h={40}
          style={{
            alignSelf: "baseline",
          }}
        />
        <Flex w={"100%"} direction={"column"}>
          <Flex gap={"xs"} align={"center"}>
            <Text fw={"bold"} c={"white"}>
              {msg.display_name}
            </Text>
            <span className={`timestamp text-muted`}>
              {formatDate(msg.created_at)}
              {msg?.is_edited
                ? msg.isPending
                  ? "editing now!"
                  : "edited"
                : msg?.isPending
                ? "sending"
                : "Sent!"}
            </span>
          </Flex>
          <EditMsg
            msg={msg}
            editedMessage={editedMessage}
            setEditedMessage={setEditedMessage}
          />
          {isURL(msg.message) ? (
            <Anchor
              className={`message-content`}
              style={{
                display: editedMessage.id ? "none" : "block",
              }}
              href={normaliseURL(msg.message)}
              target="_blank"
            >
              {normaliseURL(msg.message)}
            </Anchor>
          ) : (
            <Text
              c={"white"}
              className={`message-content`}
              style={{
                display: editedMessage.id ? "none" : "block",
              }}
            >
              {msg.message}
            </Text>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default MsgItemInner;
