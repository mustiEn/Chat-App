import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../socket";
import { formatDate } from "../utils";
import { Modal, Button, Text, Flex, Image } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useCallback } from "react";

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

        queryClient.setQueryData(
          ["pinnedMessages", receiverId],
          (olderData) => [msg, ...(olderData ?? [])]
        );
        queryClient.setQueryData(["chatMessages", receiverId], (olderData) => {
          const index = olderData.dms.findIndex(({ id }) => id == msg.id);
          const currDms = [...olderData.dms];
          currDms[index].is_pinned = true;

          return {
            ...olderData,
            dms: currDms,
          };
        });
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

      queryClient.setQueryData(
        ["chatMessages", String(receiverId)],
        (olderData) => {
          const { dms } = olderData;
          const currDms = [...dms];
          const index = currDms.findIndex(({ id }) => id == msg.id);
          const msgsRepliedToIndex = currDms.reduce((acc, curr, i) => {
            if (curr.replied_msg_id == msg.id) acc.push(i);
            return acc;
          }, []);

          console.log(msgsRepliedToIndex);

          if (msgsRepliedToIndex.length)
            msgsRepliedToIndex.forEach((e) => {
              console.log(currDms[e]);
              currDms[e].is_replied_msg_deleted = true;
            });
          currDms.splice(index, 1);

          return {
            ...olderData,
            dms: currDms,
          };
        }
      );
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

          queryClient.setQueryData(
            ["pinnedMessages", receiverId],
            (olderData) => {
              const filteredData = [...olderData].filter(
                ({ id }) => id != msg.id
              );

              return filteredData;
            }
          );
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

        queryClient.setQueryData(
          ["pinnedMessages", receiverId],
          (olderData) => {
            const filteredData = [...olderData].filter(
              ({ id }) => id != msg.id
            );

            return filteredData;
          }
        );
        queryClient.setQueryData(["chatMessages", receiverId], (olderData) => {
          const index = olderData.dms.findIndex(({ id }) => id == msg.id);
          const currDms = [...olderData.dms];
          currDms[index].is_pinned = false;

          return {
            ...olderData,
            dms: currDms,
          };
        });
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
