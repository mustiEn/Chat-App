import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { socket } from "../socket";
import { useQueryClient } from "@tanstack/react-query";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { useNewPinnedMsgIndicatorStore } from "../stores/useNewPinnedMsgIndicatorStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Flex } from "@mantine/core";
import { addDmHistoryUsers } from "../utils/dmHistoryUsers.js";
import {
  addReceivedFriendRequest,
  removeSentFriendRequest,
} from "../utils/friendRequests.js";
import { addFriends, removeFriend } from "../utils/friends.js";
import {
  addReceivedMessageRequests,
  removeSentMessageRequest,
} from "../utils/msgRequests.js";
import {
  addPinnedMessages,
  removePinnedMessage,
} from "../utils/pinnedMessages.js";
import {
  addMessage,
  deleteMessage,
  editMessage,
} from "../utils/chatMessages.js";

const MainPanel = () => {
  const queryClient = useQueryClient();
  const addToNewPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.addToNewPinnedMsgExists
  );
  const addToReceivers = useReceiverStore((s) => s.addToReceivers);
  const [groupChat, setGroupChat] = useState({});

  const scrollElementRef = useRef(null);
  const dmChatRef = useRef({
    scrollPosition: {},
    prevScrollHeight: {},
    isPinnedMessagesFetched: {},
    initialPageParam: {},
    dmPanel: {
      chatMessagesUpdatedAt: {},
      isInitialDmDataFetched: false,
    },
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

      result.forEach(({ from_id, id, message }) => {
        editMessage(queryClient, String(from_id), id, message, false);
      });
    };
    const handleNewMessages = ({ result }) => {
      console.log("new msgs: ", result);

      result.forEach((newMsg) => {
        addMessage(queryClient, String(newMsg.from_id), newMsg);
        socket.auth.serverOffset[newMsg.from_id] = newMsg.id;
      });
    };
    const handlePinnedMessages = ({ result, isRecovery }) => {
      const { showPinnedMsgBox } = useShowPinnedMsgBoxStore.getState();

      if (!isRecovery) {
        const { last_pin_action_by_id, is_pinned, id } = result;

        const isQueryFetched = queryClient.getQueryState([
          "pinnedMessages",
          String(last_pin_action_by_id),
        ]);

        //^ here, add a notification and amend if needed.if notification is here,no need to check ispinned, cuz now i cant know whether to notify on mount

        if (isQueryFetched) {
          if (is_pinned) {
            const val = !showPinnedMsgBox[last_pin_action_by_id];

            addPinnedMessages(queryClient, String(last_pin_action_by_id), id);
            addToNewPinnedMsgExists(last_pin_action_by_id, val); //* if the modal is open,dont notify the user, if not, do it
          } else {
            removePinnedMessage(queryClient, String(last_pin_action_by_id), id);
          }
        }
      } else {
        result.forEach(({ last_pin_action_by_id, is_pinned, id }) => {
          const isQueryFetched = queryClient.getQueryState([
            "pinnedMsgs",
            String(last_pin_action_by_id),
          ]);

          //^ notification thing applies to this here too.

          if (isQueryFetched) {
            if (is_pinned) {
              const val = !showPinnedMsgBox[last_pin_action_by_id];

              addPinnedMessages(queryClient, String(last_pin_action_by_id), id);
              addToNewPinnedMsgExists(last_pin_action_by_id, val); //* if the modal is open,dont notify the user, if not, do it
            } else {
              removePinnedMessage(
                queryClient,
                String(last_pin_action_by_id),
                id
              );
            }
          }
        });
      }
    };
    const handleMessageRequestAcceptance = ({ result }) => {
      const dmHistoryUsers = queryClient.getQueryData(["dmHistory"]);
      console.log("handleMessageRequestAcceptance");

      result.forEach((reqAcceptance) => {
        console.log("reqAcceptance", reqAcceptance);

        const isQueryFetched = queryClient.getQueryState([
          "chatMessages",
          String(reqAcceptance.from_id),
        ]);
        //^ This is to keep cache empty if undefined cuz on dmpanel mount,its already gonna comeup
        if (isQueryFetched && reqAcceptance.id)
          addMessage(queryClient, String(reqAcceptance.from_id), reqAcceptance);

        removeSentMessageRequest(queryClient, reqAcceptance.from_id);

        const isUserInDmHistory = dmHistoryUsers.some(
          (i) => i.id == reqAcceptance.from_id
        );

        if (!isUserInDmHistory)
          addDmHistoryUsers(queryClient, [reqAcceptance.from_id]);
        socket.emit("join room", reqAcceptance.from_id);
      });
    };
    const handleMessageRequests = ({ result }) => {
      const dmHistoryUsers = queryClient.getQueryData(["dmHistory"]);

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

        if (!isUserInDmHistory) addDmHistoryUsers(queryClient, [dmHistoryUser]);

        addMessage(queryClient, String(req.from_id), req);
        addReceivedMessageRequests(queryClient, [req]);
        addToReceivers(req.from_id, dmHistoryUser);
      });
    };
    const handleDeletedMessages = ({ result, userId }) => {
      result.forEach((deletedMsgId) => {
        const isPinnedMsgsQueryFetched = queryClient.getQueryData([
          "pinnedMessages",
          String(userId),
        ]);
        const isChatQueryFetched = queryClient.getQueryData([
          "chatMessages",
          String(userId),
        ]);

        if (isPinnedMsgsQueryFetched) {
          const isMsgPinned = olderData.findIndex(
            ({ id }) => id == deletedMsgId
          );
          s
          if (isMsgPinned)
            removePinnedMessage(queryClient, String(userId), deletedMsgId);
        }
        if (isChatQueryFetched) {
          deleteMessage(queryClient, String(userId), deletedMsgId);
        }
      });
    };
    const handleRemovedFriends = ({ result }) => {
      result.forEach((id) => removeFriend(queryClient, id));
    };
    const handleFriendRequests = ({ result }) => {
      addReceivedFriendRequest(queryClient, result);
    };
    const handleFriendRequestAcceptance = ({ result }) => {
      result.forEach(({ sender, status }) => {
        if (status === "accepted") addFriends(queryClient, [sender]);
        console.log("status:", status);

        removeSentFriendRequest(queryClient, sender.id);
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
