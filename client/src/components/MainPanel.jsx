import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { socket } from "../socket";
import { useQueryClient } from "@tanstack/react-query";
import { useMsgRequestStore } from "../stores/useMsgRequestStore.js";
import { useDmHistoryUserStore } from "../stores/useDmHistoryUserStore.js";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { useNewPinnedMsgIndicatorStore } from "../stores/useNewPinnedMsgIndicatorStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Flex } from "@mantine/core";
import { useFriendStore } from "../stores/useFriendStore.js";
import { useFriendRequestStore } from "../stores/useFriendRequestStore.js";

const MainPanel = () => {
  const queryClient = useQueryClient();
  const removeSentRequest = useMsgRequestStore((s) => s.removeSentRequest);
  const addReceivedRequest = useMsgRequestStore((s) => s.addReceivedRequest);
  const addToNewPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.addToNewPinnedMsgExists
  );
  const addToDmHistoryUsers = useDmHistoryUserStore(
    (s) => s.addToDmHistoryUsers
  );
  const removeFromFriends = useFriendStore((s) => s.removeFromFriends);
  const addToFriends = useFriendStore((s) => s.addToFriends);
  const addReceivedFriendRequest = useFriendRequestStore(
    (s) => s.addReceivedRequest
  );
  const removeSentFriendRequest = useFriendRequestStore(
    (s) => s.removeSentRequest
  );
  const sentFriendRequest = useFriendRequestStore(
    (s) => s.friendRequests.sentRequests
  );
  const addToReceivers = useReceiverStore((s) => s.addToReceivers);
  const [groupChat, setGroupChat] = useState({});
  const scrollElementRef = useRef(null);
  const dmChatRef = useRef({
    scrollPosition: {},
    prevScrollHeight: {},
    prevChatDataUpdatedAtRef: {},
    initialPageParam: {},
  });

  useEffect(() => {
    const onConnect = () => {
      console.log("✅ Socket connected");
    };
    const onConnectErr = (err) => {
      console.error("❌ Socket connection error:", err);
    };
    const getInitial = (user) => {
      socket.auth.user = user;
      // console.log(userId);
    };
    const onDisconnect = (reason) => {
      console.log("❌ Socket disconnected, ", reason);
    };
    const handleEditedMessages = ({ result }) => {
      console.log("Edited msgs: ", result);

      result.forEach((editedMsg) => {
        const { dms } = queryClient.getQueryData([
          "chatMessages",
          String(editedMsg.from_id),
        ]);

        const mappedDms = dms.map((m) =>
          m.id == editedMsg.id
            ? {
                ...m,
                message: editedMsg.message,
                is_edited: true,
              }
            : m
        );

        queryClient.setQueryData(
          ["chatMessages", String(editedMsg.from_id)],
          (olderData) => ({
            ...olderData,
            dms: mappedDms,
          })
        );
      });
    };
    const handleNewMessages = ({ result }) => {
      console.log("new msgs: ", result);

      result.forEach((newMsg) => {
        queryClient.setQueryData(
          ["chatMessages", String(newMsg.from_id)],
          (oldData) => ({
            ...oldData,
            dms: [...oldData.dms, newMsg],
          })
        );

        socket.auth.serverOffset[newMsg.from_id] = newMsg.id;
      });
    };
    const handlePinnedMessages = ({ result, isRecovery }) => {
      const { showPinnedMsgBox } = useShowPinnedMsgBoxStore.getState();

      if (!isRecovery) {
        const { last_pin_action_by_id: lastPinActionById, is_pinned } = result;

        const queryData = queryClient.getQueryState([
          "pinnedMessages",
          String(lastPinActionById),
        ]);
        const isQueryFetched = queryData?.data ?? undefined;

        //^ here, add a notification and amend if needed.if notification is here,no need to check ispinned, cuz now i cant know whether to notify on mount

        if (is_pinned) {
          const val = showPinnedMsgBox[lastPinActionById] ? false : true;

          addToNewPinnedMsgExists(lastPinActionById, val); //* if the modal is open,dont notify the user, if not, do it
        }

        if (!isQueryFetched) return; //* if not already fetch,skip since its gonna fetch it on mount

        queryClient.setQueryData(
          ["pinnedMessages", String(lastPinActionById)],
          (olderData) => {
            if (is_pinned) {
              return [result, ...(olderData ?? [])];
            } else {
              const filteredData = olderData.filter(
                ({ id }) => id != result.id
              );

              return filteredData;
            }
          }
        );
      } else {
        result.forEach((pinnedMsg) => {
          const { last_pin_action_by_id: lastPinActionById, is_pinned } =
            pinnedMsg;
          const isQueryFetched = queryClient.getQueryState([
            "pinnedMsgs",
            String(lastPinActionById),
          ]);

          //^ notification thing applies to this here too.
          if (is_pinned) {
            const val = showPinnedMsgBox[lastPinActionById] ? false : true;

            addToNewPinnedMsgExists(lastPinActionById, val); //* if the modal is open,dont notify the user, if not, do it
          }
          if (!isQueryFetched) return; //* if not already fetch,skip since its gonna fetch it on mount

          queryClient.setQueryData(
            ["pinnedMessages", String(lastPinActionById)],
            (olderData) => {
              if (is_pinned) {
                const pinnedMsgAlreadyExists = olderData.find(
                  ({ id }) => id == pinnedMsg.id
                );

                if (pinnedMsgAlreadyExists) {
                  olderData.filter((e) => e.id != pinnedMsg.id);
                }

                return [pinnedMsg, ...(olderData ?? [])];
              } else {
                const filteredData = olderData.filter(
                  ({ id }) => id != pinnedMsg.id
                );

                return filteredData;
              }
            }
          );
        });
      }
    };
    const handleMessageRequestAcceptance = ({ result }) => {
      const { dmHistoryUsers } = useDmHistoryUserStore.getState();
      console.log("handleMessageRequestAcceptance");

      result.forEach((reqAcceptance) => {
        console.log("reqAcceptance", reqAcceptance);

        const state = queryClient.getQueryState([
          "chatMessages",
          String(reqAcceptance.from_id),
        ]);
        //^ This is to keep cache empty if undefined cuz on dmpanel mount,its already gonna comeup
        if (state && reqAcceptance.id) {
          queryClient.setQueryData(
            ["chatMessages", String(reqAcceptance.from_id)],
            (olderData) => ({
              ...olderData,
              dms: [...(olderData?.dms ?? []), reqAcceptance],
            })
          );
        }

        removeSentRequest(reqAcceptance.from_id);

        const isUserInDmHistory = dmHistoryUsers.some(
          (i) => i.id == reqAcceptance.from_id
        );

        if (!isUserInDmHistory) addToDmHistoryUsers([reqAcceptance.from_id]);
        socket.emit("join room", reqAcceptance.from_id);
      });
    };
    const handleMessageRequests = ({ result }) => {
      const { dmHistoryUsers } = useDmHistoryUserStore.getState();

      result.forEach((req) => {
        const isUserInDmHistory = dmHistoryUsers.some(
          ({ id }) => id == req.from_id
        );
        const dmHistoryUser = {
          id: req.from_id,
          display_name: req.display_name,
          username: req.username,
          profile: req.profile,
        };

        queryClient.setQueryData(
          ["chatMessages", String(req.from_id)],
          (olderData) => ({
            ...olderData,
            dms: [req],
          })
        );

        addReceivedRequest([req]);
        addToReceivers(req.from_id, dmHistoryUser);

        if (!isUserInDmHistory) addToDmHistoryUsers([dmHistoryUser]);
      });
    };
    const handleDeletedMessages = ({ result, userId }) => {
      result.forEach((deletedMsgId) => {
        const isPinnedMsgsDataFetched = queryClient.getQueryData([
          "pinnedMessages",
          String(userId),
        ]);
        const isChatDataFetched = queryClient.getQueryData([
          "chatMessages",
          String(userId),
        ]);

        if (isPinnedMsgsDataFetched) {
          queryClient.setQueryData(
            ["pinnedMessages", String(userId)],
            (olderData) => {
              const isMsgPinned = olderData.findIndex(
                ({ id }) => id == deletedMsgId
              );

              if (isMsgPinned === -1) return olderData;

              const filteredData = [...olderData].filter(
                ({ id }) => id != deletedMsgId
              );
              return filteredData;
            }
          );
        }
        if (isChatDataFetched) {
          queryClient.setQueryData(
            ["chatMessages", String(userId)],
            (olderData) => {
              const { dms } = olderData;
              const currDms = [...dms];
              const index = currDms.findIndex(({ id }) => id == deletedMsgId);
              const msgsRepliedToIndex = currDms.reduce((acc, curr, i) => {
                if (curr.replied_msg_id === deletedMsgId) acc.push(i);

                return acc;
              }, []);

              console.log(currDms);
              console.log(msgsRepliedToIndex);

              if (msgsRepliedToIndex.length)
                msgsRepliedToIndex.forEach((e) => {
                  currDms[e].is_replied_msg_deleted = true;
                });

              currDms.splice(index, 1);

              return {
                ...olderData,
                dms: currDms,
              };
            }
          );
        }
      });
    };
    const handleRemovedFriends = ({ result }) => {
      result.forEach((id) => removeFromFriends(id));
    };
    const handleFriendRequests = ({ result }) => {
      addReceivedFriendRequest(result);
    };
    const handleFriendRequestAcceptance = ({ result }) => {
      result.forEach(({ sender, status }) => {
        if (status === "accepted") addToFriends([sender]);
        console.log("status:", status);
        console.log(sender.id);
        console.log(sentFriendRequest);

        removeSentFriendRequest(sender.id);
        console.log(sentFriendRequest);
      });
    };

    socket.connect();
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectErr);
    socket.on("initial", getInitial);
    socket.on("receive dms", handleNewMessages);
    socket.on("receive msg requests", handleMessageRequests);
    socket.on("receive msg request acceptance", handleMessageRequestAcceptance);
    socket.on("receive deleted msgs", handleDeletedMessages);
    socket.on("receive edited msgs", handleEditedMessages);
    socket.on("receive pinned msgs", handlePinnedMessages);
    socket.on("receive removed friends", handleRemovedFriends);
    socket.on("receive friend requests", handleFriendRequests);
    socket.on(
      "receive friend request acceptance",
      handleFriendRequestAcceptance
    );
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", (err) =>
      console.error("⚠️ Connect error:", err)
    );

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectErr);
      socket.off("initial", getInitial);
      socket.off("receive edited msgs", handleEditedMessages);
      socket.off("receive dms", handleNewMessages);
      socket.off("receive msg requests", handleMessageRequests);
      socket.off(
        "receive msg request acceptance",
        handleMessageRequestAcceptance
      );
      socket.off("receive deleted msgs", handleDeletedMessages);
      socket.off("receive pinned msgs", handlePinnedMessages);
      socket.off("receive removed friends", handleRemovedFriends);
      socket.off("receive friend requests", handleFriendRequests);
      socket.off(
        "receive friend request acceptance",
        handleFriendRequestAcceptance
      );
      socket.off("disconnect", onDisconnect);
      socket.disconnect();

      queryClient.removeQueries();
      console.log("SOCKET DISCONNECTED layout");
    };
  }, []);

  return (
    <>
      <Flex w={"100%"}>
        <Sidebar />
        <Flex
          direction={"column"}
          // w={"100%"}
          style={{
            borderLeft: "none",
            borderRight: "none",
            flex: "1 0 auto",
          }}
        >
          <Outlet
            context={{
              groupChat,
              setGroupChat,
              scrollElementRef,
              dmChatRef,
            }}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default MainPanel;
