import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import "../css/main_panel.css";
import Sidebar from "./Sidebar";
import { socket } from "../socket";
import { useQueryClient } from "@tanstack/react-query";
import { useMsgRequestStore } from "../stores/useMsgRequestStore.js";
import { useDmHistoryUserStore } from "../stores/useDmHistoryUserStore.js";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { useNewPinnedMsgIndicatorStore } from "../stores/useNewPinnedMsgIndicatorStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";

const MainPanel = () => {
  const queryClient = useQueryClient();
  const removeFromMyRequests = useMsgRequestStore(
    (state) => state.removeFromMyRequests
  );
  const addToOthersRequests = useMsgRequestStore(
    (state) => state.addToOthersRequests
  );
  const addToNewPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (state) => state.addToNewPinnedMsgExists
  );
  const receivers = useReceiverStore((state) => state.receivers);
  const addToDmHistoryUsers = useDmHistoryUserStore(
    (state) => state.addToDmHistoryUsers
  );
  const addToReceivers = useReceiverStore((state) => state.addToReceivers);
  const [groupChat, setGroupChat] = useState({});
  const scrollElementRef = useRef(null);
  const dmChatRef = useRef({
    scrollPosition: {},
    prevScrollHeight: {},
    prevChatDataUpdatedAtRef: {},
    initialPageParam: {},
  });

  useEffect(() => {
    console.log("Main panel");
  }, []);

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
          "initialChatData",
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
          ["initialChatData", String(editedMsg.from_id)],
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
          ["initialChatData", String(newMsg.from_id)],
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
          "pinnedMsgs",
          String(lastPinActionById),
        ]);
        const isQueryFetched = queryData?.data ?? undefined;
        // console.log(queryClient.getQueriesData());

        //^ here, add a notification and amend if needed.if notification is here,no need to check ispinned, cuz now i cant know whether to notify on mount
        if (is_pinned) {
          const val = showPinnedMsgBox[lastPinActionById] ? false : true;

          addToNewPinnedMsgExists(lastPinActionById, val); //* if the modal is open,dont notify the user, if not, do it
        }

        if (!isQueryFetched) return; //* if not already fetch,skip since its gonna fetch it on mount

        queryClient.setQueryData(
          ["pinnedMsgs", String(lastPinActionById)],
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
            ["pinnedMsgs", String(lastPinActionById)],
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

    socket.connect();
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectErr);
    socket.on("initial", getInitial);
    socket.on("receive dms", handleNewMessages);
    socket.on("receive edited msgs", handleEditedMessages);
    socket.on("receive pinned msgs", handlePinnedMessages);
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
      socket.off("receive pinned msgs", handlePinnedMessages);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();

      queryClient.removeQueries();
      console.log("SOCKET DISCONNECTED layout");
    };
  }, []);

  useEffect(() => {
    const receiveMessageRequestAcceptance = ({ result }) => {
      const { dmHistoryUsers } = useDmHistoryUserStore.getState();
      console.log("receiveMessageRequestAcceptance");

      result.forEach((reqAcceptance) => {
        console.log("reqAcceptance", reqAcceptance);

        const state = queryClient.getQueryState([
          "initialChatData",
          String(reqAcceptance.from_id),
        ]);
        //^ This is to keep cache empty if undefined cuz on dmpanel mount,its already gonna comeup
        if (state && reqAcceptance.id) {
          queryClient.setQueryData(
            ["initialChatData", String(reqAcceptance.from_id)],
            (olderData) => ({
              ...olderData,
              dms: [...(olderData?.dms ?? []), reqAcceptance],
            })
          );
        }

        removeFromMyRequests(reqAcceptance.from_id);

        const isUserInDmHistory = dmHistoryUsers.some(
          (i) => i.id == reqAcceptance.from_id
        );

        if (!isUserInDmHistory) addToDmHistoryUsers([reqAcceptance.from_id]);
        socket.emit("join room", reqAcceptance.from_id);
      });
    };
    const handleMessageRequests = ({ result }) => {
      const { dmHistoryUsers } = useDmHistoryUserStore.getState();
      console.log(result);

      result.forEach((req) => {
        console.log(req);
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
          ["initialChatData", String(req.from_id)],
          (olderData) => ({
            ...olderData,
            dms: [req],
          })
        );

        addToOthersRequests([req]);
        addToReceivers(req.from_id, dmHistoryUser);
        console.log(receivers);

        if (!isUserInDmHistory) addToDmHistoryUsers([dmHistoryUser]);
      });
    };
    socket.on(
      "receive msg request acceptance",
      receiveMessageRequestAcceptance
    );
    socket.on("receive msg requests", handleMessageRequests);

    return () => {
      socket.off(
        "receive msg request acceptance",
        receiveMessageRequestAcceptance
      );
      socket.off("receive msg requests", handleMessageRequests);
    };
  }, []);

  return (
    <>
      <div id="mainPanel" className="d-flex w-100">
        <Sidebar />
        <div className="d-flex flex-column border border-white border-opacity-25 border-start-0 border-end-0 w-100">
          <Outlet
            context={{
              groupChat,
              setGroupChat,
              scrollElementRef,
              dmChatRef,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default MainPanel;
