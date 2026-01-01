import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../socket.js";
import { formatDate } from "../utils/index.js";
import { Modal, Button, Text, Flex, Image } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useCallback, useContext } from "react";
import {
  addPinnedMessages,
  removePinnedMessage,
} from "../utils/dmPinnedMessages.js";
import { deleteMessage, setIsMessagePinned } from "../utils/directMessages.js";
import { useModalStore } from "../stores/useModalStore.js";
import toast from "react-hot-toast";

const PanelModalNotifier = ({ activeMsg, panelName }) => {
  const { msg, type } = activeMsg.current;
  const params = useParams();
  const paramId = panelName === "group" ? params.groupId : params.chatId;
  const queryClient = useQueryClient();
  const pinDmMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't pin the message");
      return;
    }
    socket.emit(
      "send pinned msgs",
      {
        id: msg.id,
        isPinned: true,
        // toId: receiverId,
      },
      paramId,
      (err, res) => {
        if (err) {
          console.log("Error: ", err);
          toast.error(err);
          return;
        }

        addPinnedMessages(queryClient, paramId, msg);
        setIsMessagePinned(queryClient, paramId, msg.id, true);
        console.log("Pinned message successfully", res);
      }
    );
  };
  const handleDeleteDmMessage = () => {
    const pinnedMsgData = queryClient.getQueryData([
      "dmPinnedMessages",
      paramId,
    ]);
    const isMsgPinned =
      pinnedMsgData?.findIndex(({ id }) => id == msg.id) ?? -1;

    if (!socket.connected) {
      toast.error("We couldn't delete the message");
      return;
    }

    socket.emit("send deleted msgs", msg, paramId, (err, res) => {
      if (err) {
        console.log("err", err);
        return;
      }

      deleteMessage(queryClient, paramId, msg.id);
      console.log("Deleted message successfully", res);
    });

    if (isMsgPinned !== -1) {
      socket.emit(
        "send pinned msgs",
        {
          id: msg.id,
          isPinned: false,
          // toId: receiverId,
        },
        (err, res) => {
          if (err) {
            console.log("err", err);
            return;
          }

          removePinnedMessage(queryClient, paramId, msg.id);
        }
      );
    }
  };
  const unPinDmMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't unpin the message");
      return;
    }

    socket.emit(
      "send pinned msgs",
      {
        id: msg.id,
        isPinned: false,
        // toId: receiverId,
      },
      paramId,
      (err, res) => {
        if (err) {
          console.log("Error: ", err);
          toast.error(err);
          return;
        }

        removePinnedMessage(queryClient, paramId, msg.id);
        setIsMessagePinned(queryClient, paramId, msg.id, false);

        // console.log("Unpinned successfully", res);
      }
    );
  };
  const pinGroupMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't pin the message");
      return;
    }
    socket.emit(
      "send pinned msgs",
      {
        id: msg.id,
        isPinned: true,
        // toId: receiverId,
      },
      paramId,
      (err, res) => {
        if (err) {
          console.log("Error: ", err);
          toast.error(err);
          return;
        }

        addPinnedMessages(queryClient, paramId, msg);
        setIsMessagePinned(queryClient, paramId, msg.id, true);
        console.log("Pinned message successfully", res);
      }
    );
  };
  const handleDeleteGroupMessage = () => {
    const pinnedMsgData = queryClient.getQueryData([
      "dmPinnedMessages",
      paramId,
    ]);
    const isMsgPinned =
      pinnedMsgData?.findIndex(({ id }) => id == msg.id) ?? -1;

    if (!socket.connected) {
      toast.error("We couldn't delete the message");
      return;
    }

    socket.emit("send deleted msgs", msg, paramId, (err, res) => {
      if (err) {
        console.log("err", err);
        return;
      }

      deleteMessage(queryClient, paramId, msg.id);
      console.log("Deleted message successfully", res);
    });

    if (isMsgPinned !== -1) {
      socket.emit(
        "send pinned msgs",
        {
          id: msg.id,
          isPinned: false,
          // toId: receiverId,
        },
        (err, res) => {
          if (err) {
            console.log("err", err);
            return;
          }

          removePinnedMessage(queryClient, paramId, msg.id);
        }
      );
    }
  };
  const unPinGroupMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't unpin the message");
      return;
    }

    socket.emit(
      "send pinned msgs",
      {
        id: msg.id,
        isPinned: false,
        // toId: receiverId,
      },
      paramId,
      (err, res) => {
        if (err) {
          console.log("Error: ", err);
          toast.error(err);
          return;
        }

        removePinnedMessage(queryClient, paramId, msg.id);
        setIsMessagePinned(queryClient, paramId, msg.id, false);

        // console.log("Unpinned successfully", res);
      }
    );
  };
  const functions = useCallback(
    {
      dm: {
        Unpin: unPinDmMessage,
        Delete: handleDeleteDmMessage,
        Pin: pinDmMessage,
      },
      group: {
        Unpin: unPinGroupMessage,
        Delete: handleDeleteGroupMessage,
        Pin: pinGroupMessage,
      },
    },
    [msg]
  );
  const opened = useModalStore((s) => s.panelModalNotifierOpened);
  const close = useModalStore((s) => s.closePanelModalNotifier);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          close();
          activeMsg.current = {
            msg: null,
            type: null,
          };
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
              functions[panelName][type]();
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

export default PanelModalNotifier;
