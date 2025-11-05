import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../socket";
import { formatDate } from "../utils/index.js";
import { Modal, Button, Text, Flex, Image } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useCallback } from "react";
import {
  addPinnedMessages,
  removePinnedMessage,
} from "../utils/pinnedMessages";
import { setIsMessagePinned } from "../utils/chatMessages.js";

const DmModalNotifier = ({
  setActiveMsg,
  activeMsg: { msg, type },
  show,
  close,
}) => {
  const { userId: receiverId } = useParams();
  const queryClient = useQueryClient();
  const pinMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't pin the message");
      return;
    }
    socket.emit(
      "send pinned msgs",
      {
        id: msg.id,
        isPinned: true,
        toId: receiverId,
      },
      (err, res) => {
        if (err) {
          console.log("Error: ", err);
        }

        addPinnedMessages(queryClient, receiverId, msg);
        setIsMessagePinned(receiverId, msg.id, true);
        console.log("Pinned message successfully", res);
      }
    );
  };
  const deleteMessage = () => {
    const pinnedMsgData = queryClient.getQueryData([
      "pinnedMessages",
      String(receiverId),
    ]);
    const isMsgPinned =
      pinnedMsgData?.findIndex(({ id }) => id == msg.id) ?? -1;

    if (!socket.connected) {
      toast.error("We couldn't delete the message");
      return;
    }

    socket.emit("send deleted msgs", msg, (err, res) => {
      if (err) {
        console.log("err", err);
        return;
      }

      deleteMessage(receiverId, msg.id);
      console.log("Deleted message successfully", res);
    });

    if (isMsgPinned !== -1) {
      socket.emit(
        "send pinned msgs",
        {
          id: msg.id,
          isPinned: false,
          toId: receiverId,
        },
        (err, res) => {
          if (err) {
            console.log("err", err);
            return;
          }

          removePinnedMessage(queryClient, receiverId, msg.id);
        }
      );
    }
  };
  const unPinMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't unpin the message");
      return;
    }

    socket.emit(
      "send pinned msgs",
      {
        id: msg.id,
        isPinned: false,
        toId: receiverId,
      },
      (err, res) => {
        if (err) {
          console.log("Error: ", err);
        }

        removePinnedMessage(queryClient, receiverId, msg.id);
        setIsMessagePinned(receiverId, msg.id, false);

        // console.log("Unpinned successfully", res);
      }
    );
  };
  const functions = useCallback(
    {
      Unpin: unPinMessage,
      Delete: deleteMessage,
      Pin: pinMessage,
    },
    [msg]
  );

  return (
    <>
      <Modal
        opened={show}
        onClose={() => {
          close();
          setActiveMsg({
            msg: null,
            type: null,
          });
        }}
        radius={"md"}
        title={type + " " + "Message"}
        styles={{
          title: {
            fontSize: "var(--mantine-h3-font-size)",
            fontWeight: "600",
          },
          header: {
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderWidth: "0 0 1px 0",
          },
        }}
        centered
      >
        <Text my={"xs"}>
          You sure you want to {type?.toLowerCase()} this message ?
        </Text>
        <Flex
          align={"center"}
          gap={"xs"}
          p={"xs"}
          bd={"1px solid #1b1b1d"}
          bdrs={"md"}
          bg={"#1b1b1d"}
          // className={`${styles["pinned-msg"]}`}
        >
          <Image
            src="https://placehold.co/40"
            style={{
              alignSelf: "baseline",
            }}
            radius={"xl"}
            w={40}
            h={40}
          />
          <Flex direction={"column"}>
            <Flex align={"center"} gap={"xs"}>
              <Text fw={"bold"}>{msg?.display_name}</Text>
              <span className={`timestamp text-muted`}>
                {formatDate(msg?.created_at)}
              </span>
            </Flex>
            <Text className={`message-content`}>{msg?.message}</Text>
          </Flex>
        </Flex>
        <Flex>
          <Button
            mt={"sm"}
            ml={"auto"}
            variant={"filled"}
            color={type == "Delete" ? "red" : "blue"}
            onClick={() => {
              functions[type]();
              close();
            }}
          >
            {type}
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default DmModalNotifier;
