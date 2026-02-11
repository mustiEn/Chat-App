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
} from "../utils/messages.js";
import UserProfileBar from "./UserProfileBar.jsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { returnLocalNow } from "../utils/index.js";
import { useAllFriends } from "../custom-hooks/useAllFriends.js";
import { PulseLoader } from "react-spinners";
import { useAuthUserStore } from "../stores/useAuthUserStore.js";
import { removeGroup } from "../utils/groups.js";
import { addGroupInvites } from "../utils/groupInvites.js";
import { removeMembers } from "../utils/groupMembers.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const MainPanel = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setDmPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.setDmPinnedMsgExists,
  );
  const setGroupPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (s) => s.setGroupPinnedMsgExists,
  );
  const addReceiver = useReceiverStore((s) => s.addReceiver);
  const receivers = useReceiverStore((s) => s.receivers);
  const blockReceiver = useReceiverStore((s) => s.blockReceiver);
  const unblockReceiver = useReceiverStore((s) => s.unblockReceiver);
  const setStatus = useReceiverStore((s) => s.setStatus);
  const [groupChat, setGroupChat] = useState({});
  const scrollElementRef = useRef(null);
  const dmChatRef = useRef({
    scrollPosition: {},
    prevTopId: {},
    isPinnedMessagesFetched: {},
    initialPageParam: {},
    dmPanel: {
      dmTopId: {},
      dmBottomId: {},
      isInitialDmDataFetched: false,
    },
    msgAddedOrDeleted: {},
  });
  const groupChatRef = useRef({
    scrollPosition: {},
    prevTopId: {},
    isPinnedMessagesFetched: {},
    initialPageParam: {},
    groupPanel: {
      groupMessagesTopId: {},
      groupMessagesBottomId: {},
      isInitialGroupDataFetched: false,
    },
    msgAddedOrDeleted: {},
  });
  const lastActivity = useRef();
  const allFriendsLastUpdatedAt = useRef(0);

  const { data, isSuccess, dataUpdatedAt } = useAllFriends();
  const newdata = data?.pages.flatMap(({ friends }) => friends) ?? [];

  useEffect(() => {
    if (!isSuccess) return;
    if (!data) return;
    if (dataUpdatedAt === allFriendsLastUpdatedAt.current) return;

    allFriendsLastUpdatedAt.current = dataUpdatedAt;
    newdata.forEach((e) => {
      if (!receivers[e.id]) {
        addReceiver(e.id, e);
      }
    });
  }, [newdata]);

  //* show spinner till user data exists

  useEffect(() => {
    const handleDmEditedMessages = ({ result, chatId }) => {
      console.log("Edited msgs: ", result);

      result.forEach(({ from_id, id, message }) => {
        editMessage("directMessages", queryClient, chatId, id, message, false);
      });
    };
    const handleDmNewMessages = ({ result, chatId }) => {
      const {
        dmPanel: { dmBottomId },
        msgAddedOrDeleted,
      } = dmChatRef.current;
      console.log("new msgs: ", result);

      result.forEach((newMsg) => {
        addMessage("directMessages", queryClient, chatId, newMsg);
        // socket.auth.serverOffset.dms[chatId] = newMsg.id;
        dmBottomId[chatId] = newMsg.id;
        msgAddedOrDeleted[chatId] = true;
      });
    };
    const handleDmPinnedMessages = ({ result, isRecovery, chatId }) => {
      const { pinnedMsgBoxObj } = useShowPinnedMsgBoxStore.getState();
      console.log(result);

      if (!isRecovery) {
        const { is_pinned, id } = result;

        //^ here, add a notification and amend if needed.if notification is here,no need to check ispinned, cuz now i cant know whether to notify on mount

        if (is_pinned) {
          const val = !pinnedMsgBoxObj.dm[chatId];
          console.log("val", val);

          addPinnedMessages("dmPinnedMessages", queryClient, chatId, result);
          setDmPinnedMsgExists(chatId, val); //* if the modal is open,dont notify the user, if not, do it
        } else {
          removePinnedMessage("dmPinnedMessages", queryClient, chatId, id);
        }

        setIsMessagePinned(
          "directMessages",
          queryClient,
          chatId,
          id,
          is_pinned,
        );
      } else {
        result.forEach((res, i) => {
          console.log(res);

          const { is_pinned, id } = res;

          //^ notification thing applies to this here too.

          if (is_pinned) {
            const val = !pinnedMsgBoxObj.dm[chatId];
            console.log("val", val);

            addPinnedMessages("dmPinnedMessages", queryClient, chatId, res);
            setDmPinnedMsgExists(chatId, val); //* if the modal is open,dont notify the user, if not, do it
          } else {
            removePinnedMessage("dmPinnedMessages", queryClient, chatId, id);
          }

          setIsMessagePinned(
            "directMessages",
            queryClient,
            chatId,
            id,
            is_pinned,
          );
        });
      }
    };
    const handleMessageRequestAcceptance = ({ result, chatIds }) => {
      const dmHistoryUsers = queryClient.getQueryData(["dmHistory"]);
      console.log("handleMessageRequestAcceptance");

      result.forEach((reqAcceptance, i) => {
        console.log("reqAcceptance", reqAcceptance);

        const isQueryFetched = queryClient.getQueryData([
          "directMessages",
          chatIds[i],
        ]);
        //^ This is to keep cache empty if undefined cuz on dmpanel mount,its already gonna comeup
        if (isQueryFetched && reqAcceptance.message)
          addMessage("directMessages", queryClient, chatIds[i], reqAcceptance);

        removeSentMessageRequest(queryClient, reqAcceptance.from_id);

        const isUserInDmHistory = dmHistoryUsers.some(
          (i) => i.id == reqAcceptance.from_id,
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
          ({ id }) => id == req.from_id,
        );
        const dmHistoryUser = {
          id: req.from_id,
          display_name: req.display_name,
          username: req.username,
          profile: req.profile,
          chatId: chatIds[i],
        };

        if (!isUserInDmHistory) addDmHistoryUsers(queryClient, [dmHistoryUser]);

        addMessage("directMessages", queryClient, chatIds[i], req);
        addReceivedMessageRequests(queryClient, [
          { ...req, chatId: chatIds[i] },
        ]);
        addReceiver(req.from_id, dmHistoryUser);
      });
    };
    const handleDmDeletedMessages = ({ result, chatId }) => {
      console.log("result", result);

      result.forEach((deletedMsgId) => {
        const { msgAddedOrDeleted } = dmChatRef.current;
        const isPinnedMsgQueryFetched = queryClient.getQueryData([
          "dmPinnedMessages",
          chatId,
        ]);

        const isMsgPinned = isPinnedMsgQueryFetched?.findIndex(
          ({ id }) => id == deletedMsgId,
        );
        if (isMsgPinned)
          removePinnedMessage(
            "dmPinnedMessages",
            queryClient,
            chatId,
            deletedMsgId,
          );

        deleteMessage("directMessages", queryClient, chatId, deletedMsgId);
        msgAddedOrDeleted[chatId] = true;
      });
    };
    const handleRemovedFriends = ({ result }) => {
      result.forEach((id) => removeFriend(queryClient, id));
      console.log(result, "removed");
    };
    const handleFriendRequests = ({ result }) => {
      addReceivedFriendRequest(queryClient, result);

      const receivers = useReceiverStore.getState().receivers;
      console.log("receivers", receivers);
      console.log("result", result);

      result.forEach(({ id }) => {
        if (receivers[id]) {
          unblockReceiver(id);
        }
      });
    };
    const handleFriendRequestAcceptance = ({ result, chatIds }) => {
      result.forEach(({ status, sender }, i) => {
        if (status === "accepted")
          addFriends(queryClient, [{ ...sender, chatId: chatIds[i] }]);
        // setStatus(sender.id, status);

        removeSentFriendRequest(queryClient, sender.id);
      });
    };
    const handleDmUserStatus = ({ result, id }) => {
      console.log("result", result);
      console.log("id:", id);

      const receivers = useReceiverStore.getState().receivers;

      result.forEach(({ userId, status }) => {
        if (receivers[userId]) setStatus(userId, status);
      });
    };
    const handleGroupUserStatus = ({ result, group_id }) => {
      console.log("result", result);
      console.log("group_id:", group_id);

      result.forEach(({ userId, status }) => {
        queryClient.setQueryData(["groupMembers", group_id], (olderData) => {
          const members = olderData?.members.map((m) => {
            return m.id == userId ? { ...m, status } : m;
          });
          return {
            ...olderData,
            members,
          };
        });
      });
    };
    const handleBlockedUsers = ({ result }) => {
      const receivers = useReceiverStore.getState().receivers;

      result.forEach(({ blockedBy }) => {
        const allFriendsQuery = queryClient.getQueryData(["allFriends"]);
        const allFriends = allFriendsQuery
          ? allFriendsQuery.pages.flatMap(({ friends }) => friends)
          : [];
        const isFriend = allFriends.some(({ id }) => id == blockedBy);

        if (receivers[blockedBy]) {
          blockReceiver(blockedBy, "receiver");

          socket.emit("leave room", blockedBy);
        }
        if (isFriend) removeFriend(queryClient, blockedBy);
      });
    };
    const handleUnblockedUsers = ({ result }) => {
      const receivers = useReceiverStore.getState().receivers;

      result.forEach((id) => {
        if (receivers[id]) {
          unblockReceiver(id);
          // socket.emit("join room", id);
        }
      });
    };
    const handleUserActivity = ({ result }) => {
      console.log("result", result);
      const receivers = useReceiverStore.getState().receivers;

      result.forEach((id) => {
        if (receivers[id]) setStatus(id, "Idle");
      });
    };
    const handleGroupEditedMessages = ({ result, groupId }) => {
      console.log("Edited msgs: ", result);

      result.forEach(({ id, message }) => {
        editMessage("groupMessages", queryClient, groupId, id, message, false);
      });
    };
    const handleGroupNewMessages = ({ result, groupId }) => {
      const {
        groupPanel: { groupMessagesBottomId },
        msgAddedOrDeleted,
      } = groupChatRef.current;
      console.log("new msgs: ", result);

      result.forEach((newMsg) => {
        addMessage("groupMessages", queryClient, groupId, newMsg);
        // socket.auth.serverOffset.dms[chatId] = newMsg.id;
        groupMessagesBottomId[groupId] = newMsg.id;
        msgAddedOrDeleted[groupId] = true;
      });
    };
    const handleGroupPinnedMessages = ({ result, isRecovery, groupId }) => {
      const { pinnedMsgBoxObj } = useShowPinnedMsgBoxStore.getState();
      console.log(result);

      if (!isRecovery) {
        const { is_pinned, id } = result;

        //^ here, add a notification and amend if needed.if notification is here,no need to check ispinned, cuz now i cant know whether to notify on mount

        if (is_pinned) {
          const val = !pinnedMsgBoxObj.group[groupId];
          console.log("val", val);

          addPinnedMessages(
            "groupPinnedMessages",
            queryClient,
            groupId,
            result,
          );
          setGroupPinnedMsgExists(groupId, val); //* if the modal is open,dont notify the user, if not, do it
        } else {
          removePinnedMessage("groupPinnedMessages", queryClient, groupId, id);
        }

        setIsMessagePinned(
          "groupMessages",
          queryClient,
          groupId,
          id,
          is_pinned,
        );
      } else {
        result.forEach((res, i) => {
          console.log(res);

          const { is_pinned, id } = res;

          //^ notification thing applies to this here too.

          if (is_pinned) {
            const val = !pinnedMsgBoxObj.group[groupId];
            console.log("val", val);

            addPinnedMessages("groupPinnedMessages", queryClient, groupId, res);
            setGroupPinnedMsgExists(groupId, val); //* if the modal is open,dont notify the user, if not, do it
          } else {
            removePinnedMessage(
              "groupPinnedMessages",
              queryClient,
              groupId,
              id,
            );
          }

          setIsMessagePinned(
            "groupMessages",
            queryClient,
            groupId,
            id,
            is_pinned,
          );
        });
      }
    };
    const handleGroupDeletedMessages = ({ result, groupId }) => {
      console.log("result", result);

      result.forEach((deletedMsgId) => {
        const { msgAddedOrDeleted } = groupChatRef.current;
        const isPinnedMsgQueryFetched = queryClient.getQueryData([
          "groupPinnedMessages",
          groupId,
        ]);

        const isMsgPinned = isPinnedMsgQueryFetched?.findIndex(
          ({ id }) => id == deletedMsgId,
        );
        if (isMsgPinned)
          removePinnedMessage(
            "groupPinnedMessages",
            queryClient,
            groupId,
            deletedMsgId,
          );

        deleteMessage("groupMessages", queryClient, groupId, deletedMsgId);
        msgAddedOrDeleted[groupId] = true;
      });
    };
    const handleGroupDeleted = ({ result }) => {
      console.log("result", result);

      result.forEach((groupId) => {
        socket.emit("leave group", groupId);
        removeGroup(queryClient, groupId);
      });
      navigate("/@me/friends");
    };
    const handleGroupInvite = ({ result }) => {
      console.log("result", result);

      result.forEach((group) => {
        addGroupInvites(queryClient, group);
      });
    };
    const handleGroupInviteAcceptance = ({ result }) => {
      console.log("result", result);

      queryClient.refetchQueries({ queryKey: ["groupMembers", result[0]] });
    };
    const handleLeaveGroup = ({ userId, groupId }) => {
      console.log("userId", userId);

      removeMembers(queryClient, userId, groupId);
      //? leaving a group on when offline, update the server admin ??
    };

    socket.on("receive dms", handleDmNewMessages);
    socket.on("receive msg requests", handleMessageRequests);
    socket.on("receive msg request acceptance", handleMessageRequestAcceptance);
    socket.on("receive dm deleted msgs", handleDmDeletedMessages);
    socket.on("receive dm edited msgs", handleDmEditedMessages);
    socket.on("receive dm pinned msgs", handleDmPinnedMessages);
    socket.on("receive removed friends", handleRemovedFriends);
    socket.on("receive friend requests", handleFriendRequests);
    socket.on("receive blocked users", handleBlockedUsers);
    socket.on("receive unblocked users", handleUnblockedUsers);
    socket.on(
      "receive friend request acceptance",
      handleFriendRequestAcceptance,
    );
    socket.on("receive dm changed user status", handleDmUserStatus);
    socket.on("receive group changed user status", handleGroupUserStatus);
    socket.on("receive user activity", handleUserActivity);
    socket.on("receive group edited msgs", handleGroupEditedMessages);
    socket.on("receive group msgs", handleGroupNewMessages);
    socket.on("receive group deleted msgs", handleGroupDeletedMessages);
    socket.on("receive group pinned msgs", handleGroupPinnedMessages);
    socket.on("receive group deleted", handleGroupDeleted);
    socket.on("receive group invite", handleGroupDeleted);
    socket.on("receive group invite acceptance", handleGroupInviteAcceptance);
    socket.on("receive leave group", handleLeaveGroup);

    return () => {
      socket.off("receive msg requests", handleMessageRequests);
      socket.off(
        "receive msg request acceptance",
        handleMessageRequestAcceptance,
      );
      socket.off("receive dms", handleDmNewMessages);

      socket.off("receive dm edited msgs", handleDmEditedMessages);
      socket.off("receive dm deleted msgs", handleDmDeletedMessages);
      socket.off("receive dm pinned msgs", handleDmPinnedMessages);
      socket.off("receive removed friends", handleRemovedFriends);
      socket.off("receive friend requests", handleFriendRequests);
      socket.off("receive blocked users", handleBlockedUsers);
      socket.off("receive unblocked users", handleUnblockedUsers);
      socket.off(
        "receive friend request acceptance",
        handleFriendRequestAcceptance,
      );
      socket.off("receive dm changed user status", handleDmUserStatus);
      socket.off("receive group changed user status", handleGroupUserStatus);
      socket.off("receive user activity", handleUserActivity);
      socket.off("receive group edited msgs", handleGroupEditedMessages);
      socket.off("receive group msgs", handleGroupNewMessages);
      socket.off("receive group deleted msgs", handleGroupDeletedMessages);
      socket.off("receive group pinned msgs", handleGroupPinnedMessages);
      socket.off("receive group deleted", handleGroupDeleted);
      socket.off("receive group invite", handleGroupInvite);
      socket.off(
        "receive group invite acceptance",
        handleGroupInviteAcceptance,
      );
      socket.off("receive leave group", handleLeaveGroup);
    };
  }, []);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     const now = returnLocalNow().valueOf();
  //     console.log("interval", now);

  //     if (now - lastActivity.current >= 3 * 60 * 1000)
  //       console.log("interval socket");

  //     socket.emit("send user activity", (err, res) => {
  //       console.log(res);
  //     });
  //   }, 60 * 1000 * 3);
  //   const updateLastActivity = () => {
  //     lastActivity.current = returnLocalNow();
  //   };

  //   document.addEventListener("mousemove", updateLastActivity);
  //   document.addEventListener("keydown", updateLastActivity);

  //   return () => {
  //     if (timer) clearInterval(timer);
  //     document.removeEventListener("mousemove", updateLastActivity);
  //     document.removeEventListener("keydown", updateLastActivity);
  //   };
  // }, []);

  return (
    <>
      <UserProfileBar />
      <Flex w={"100%"}>
        <Sidebar />
        <Flex
          direction={"column"}
          // w={"100%"}
          style={{
            borderLeft: "none",
            borderRight: "none",
            flexGrow: 1,
            maxWidth: "100%",
          }}
        >
          <Outlet
            context={{
              groupChat,
              setGroupChat,
              scrollElementRef,
              dmChatRef,
              groupChatRef,
              allFriendsLastUpdatedAt,
            }}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default MainPanel;
