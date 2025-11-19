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
  setIsMessagePinned,
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
    prevTopId: {},
    isPinnedMessagesFetched: {},
    initialPageParam: {},
    dmPanel: {
      chatMessagesTopId: {},
      chatMessagesBottomId: {},
      isInitialDmDataFetched: false,
    },
    msgAddedOrDeleted: {},
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
    const handleEditedMessages = ({ result, chatId }) => {
      console.log("Edited msgs: ", result);

      result.forEach(({ from_id, id, message }) => {
        editMessage(queryClient, chatId, id, message, false);
      });
    };
    const handleNewMessages = ({ result, chatId }) => {
      const {
        dmPanel: { chatMessagesBottomId },
        msgAddedOrDeleted,
      } = dmChatRef.current;
      console.log("new msgs: ", result);

      result.forEach((newMsg) => {
        addMessage(queryClient, chatId, newMsg);
        // socket.auth.serverOffset[newMsg.from_id] = newMsg.id;
        chatMessagesBottomId[chatId] = newMsg.id;
        msgAddedOrDeleted[chatId] = true;
      });
    };
    const handlePinnedMessages = ({ result, isRecovery, chatId }) => {
      const { showPinnedMsgBox } = useShowPinnedMsgBoxStore.getState();
      console.log(result);

      if (!isRecovery) {
        const { last_pin_action_by_id, is_pinned, id } = result;

        const isPinnedMessagesQueryFetched = queryClient.getQueryData([
          "pinnedMessages",
          chatId,
        ]);
        const isChatMessagesQueryFetched = queryClient.getQueryData([
          "chatMessages",
          chatId,
        ]);

        //^ here, add a notification and amend if needed.if notification is here,no need to check ispinned, cuz now i cant know whether to notify on mount

        if (isPinnedMessagesQueryFetched) {
          if (is_pinned) {
            const val = !showPinnedMsgBox[chatId];

            addPinnedMessages(queryClient, chatId, result);
            addToNewPinnedMsgExists(chatId, val); //* if the modal is open,dont notify the user, if not, do it
          } else {
            removePinnedMessage(queryClient, chatId, id);
          }
        }
        if (isChatMessagesQueryFetched) {
          setIsMessagePinned(queryClient, chatId, id, is_pinned);
        }
      } else {
        result.forEach((res, i) => {
          console.log(res);

          const { last_pin_action_by_id, is_pinned, id } = res;
          const isPinnedMessagesQueryFetched = queryClient.getQueryData([
            "pinnedMessages",
            chatId,
          ]);
          const isChatMessagesQueryFetched = queryClient.getQueryData([
            "chatMessages",
            chatId,
          ]);

          //^ notification thing applies to this here too.

          if (isPinnedMessagesQueryFetched) {
            if (is_pinned) {
              const val = !showPinnedMsgBox[chatId];

              addPinnedMessages(queryClient, chatId, res);
              addToNewPinnedMsgExists(chatId, val); //* if the modal is open,dont notify the user, if not, do it
            } else {
              removePinnedMessage(queryClient, chatId, id);
            }
          }
          if (isChatMessagesQueryFetched) {
            setIsMessagePinned(queryClient, chatId, id, is_pinned);
          }
        });
      }
    };
    const handleMessageRequestAcceptance = ({ result, chatIds }) => {
      const dmHistoryUsers = queryClient.getQueryData(["dmHistory"]);
      console.log("handleMessageRequestAcceptance");

      result.forEach((reqAcceptance, i) => {
        console.log("reqAcceptance", reqAcceptance);

        const isQueryFetched = queryClient.getQueryData([
          "chatMessages",
          chatIds[i],
        ]);
        //^ This is to keep cache empty if undefined cuz on dmpanel mount,its already gonna comeup
        if (isQueryFetched && reqAcceptance.message)
          addMessage(queryClient, chatIds[i], reqAcceptance);

        removeSentMessageRequest(queryClient, reqAcceptance.from_id);

        const isUserInDmHistory = dmHistoryUsers.some(
          (i) => i.id == reqAcceptance.from_id
        );
        const dmHistoryUser = {
          id: reqAcceptance.from_id,
          display_name: req.display_name,
          username: req.username,
          profile: req.profile,
          chatId: chatIds[i],
        };

        if (!isUserInDmHistory) addDmHistoryUsers(queryClient, [dmHistoryUser]);
        socket.emit("join room", chatIds[i]);
      });
    };
    const handleMessageRequests = ({ result, chatIds }) => {
      const dmHistoryUsers = queryClient.getQueryData(["dmHistory"]);

      result.forEach((req, i) => {
        const isUserInDmHistory = dmHistoryUsers.some(
          ({ id }) => id == req.from_id
        );
        const dmHistoryUser = {
          id: req.from_id,
          display_name: req.display_name,
          username: req.username,
          profile: req.profile,
          chatId: chatIds[i],
        };

        if (!isUserInDmHistory) addDmHistoryUsers(queryClient, [dmHistoryUser]);

        addMessage(queryClient, chatIds[i], req);
        addReceivedMessageRequests(queryClient, [
          { ...req, chatId: chatIds[i] },
        ]);
        addToReceivers(req.from_id, dmHistoryUser);
      });
    };
    const handleDeletedMessages = ({ result, chatId }) => {
      console.log("result", result);

      result.forEach(({ id: deletedMsgId }) => {
        const { msgAddedOrDeleted } = dmChatRef.current;
        const isPinnedMsgsQueryFetched = queryClient.getQueryData([
          "pinnedMessages",
          chatId,
        ]);
        const isChatQueryFetched = queryClient.getQueryData([
          "chatMessages",
          chatId,
        ]);

        if (isPinnedMsgsQueryFetched) {
          const isMsgPinned = isPinnedMsgsQueryFetched.findIndex(
            ({ id }) => id == deletedMsgId
          );
          if (isMsgPinned)
            removePinnedMessage(queryClient, chatId, deletedMsgId);
        }
        if (isChatQueryFetched) {
          deleteMessage(queryClient, chatId, deletedMsgId);
          msgAddedOrDeleted[chatId] = true;
        }
      });
    };
    const handleRemovedFriends = ({ result }) => {
      result.forEach((id) => removeFriend(queryClient, id));
      console.log(result, "removed");
    };
    const handleFriendRequests = ({ result }) => {
      addReceivedFriendRequest(queryClient, result);
    };
    const handleFriendRequestAcceptance = ({ result, chatIds }) => {
      console.log("handleFriendRequestAcceptance", result);

      result.forEach((e, i) => {
        if (e.status === "accepted")
          addFriends(queryClient, [{ ...e.sender, chatId: chatIds[i] }]);
        console.log("status:", e.status);

        removeSentFriendRequest(queryClient, e.sender.id);
      });
    };
    const handleUserStatus = (res) => {
      console.log("result", res);
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
    socket.on("status", handleUserStatus);
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
      socket.off("status", handleUserStatus);
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
