import React from "react";
import EditDm from "./EditDm";
import { formatDate } from "../utils";
import MsgRepliedDiv from "../components/MsgRepliedDiv";
import { Flex, Image, Text } from "@mantine/core";

const DmItemInner = ({ msg = [], editedMessage, setEditedMessage }) => {
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
          <EditDm
            msg={msg}
            editedMessage={editedMessage}
            setEditedMessage={setEditedMessage}
          />
          <Text
            c={"white"}
            className={`message-content`}
            style={{
              display: editedMessage.id ? "none" : "block",
            }}
          >
            {msg.message}
          </Text>
        </Flex>
      </Flex>
    </>
  );
};

export default DmItemInner;
