import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import "../css/main_panel.css";
import Sidebar from "./Sidebar";
import { socket } from "../socket";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const MainPanel = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const [dmChat, setDmChat] = useState({
    messages: {},
    pendingMessages: {},
    pinnedMsgs: {},
    newPinnedMsgExists: {},
    showPinnedMsgs: {},
    msgToReply: null,
    hasMoreUp: {},
    scrollPosition: {},
    receivers: {},
  });
  const [msgRequests, setMsgRequests] = useState({
    fromOthers: [],
    fromMe: [],
  });
  const [dmHistoryUsers, setDmHistoryUsers] = useState([]);
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
      const newEditedMessages = result[0] ? result : [result];
      newEditedMessages.forEach((editedMsg) => {
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
      const newMsgs = result[0] ? result : [result];
      newMsgs.forEach((newMsg) => {
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
      if (!isRecovery) {
        const pinnedMsg = result;
        const { last_pin_action_by_id: lastPinActionById, is_pinned } =
          pinnedMsg;

        const isQueryFetched = queryClient.getQueryState([
          "pinnedMsgs",
          String(lastPinActionById),
        ]);

        //^ here, add a notification and amend if needed.if notification is here,no need to check ispinned, cuz now i cant know whether to notify on mount
        if (is_pinned) {
          setDmChat((prev) => ({
            ...prev,
            newPinnedMsgExists: {
              ...prev.newPinnedMsgExists,
              [lastPinActionById]: prev.showPinnedMsgs[lastPinActionById]
                ? false
                : true, //* if the modal is open,dont notify the user, if not, do it
            },
          }));
        }
        if (!isQueryFetched) return; //* if not already fetch,skip since its gonna fetch it on mount

        queryClient.setQueryData(
          ["pinnedMsgs", String(lastPinActionById)],
          (olderData) => {
            if (is_pinned) {
              return [pinnedMsg, ...(olderData ?? [])];
            } else {
              const filteredData = olderData.filter(
                ({ id }) => id != pinnedMsg.id
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
            setDmChat((prev) => ({
              ...prev,
              newPinnedMsgExists: {
                ...prev.newPinnedMsgExists,
                [lastPinActionById]: prev.showPinnedMsgs[lastPinActionById]
                  ? false
                  : true, //* if the modal is open,dont notify the user, if not, do it
              },
            }));
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
    const receiveMessageRequestAcceptance = ({ sender, result }) => {
      console.log("receiveMessageRequestAcceptance func runnning", sender);
      socket.emit("join room", sender.id);

      const state = queryClient.getQueryState([
        "initialChatData",
        String(sender.id),
      ]);
      //^ This is to keep cache empty if undefined cuz on dmpanel mount,its already gonna comeup
      if (state && Object.keys(result).length) {
        queryClient.setQueryData(
          ["initialChatData", String(sender.id)],
          (olderData) => ({
            ...olderData,
            dms: [...(olderData?.dms ?? []), result],
          })
        );
      }

      setMsgRequests((prev) => {
        const filtered = prev.fromMe.filter(({ to_id }) => to_id != sender.id);

        return {
          ...prev,
          fromMe: filtered,
        };
      });

      const isUserInDmHistory = dmHistoryUsers.some((i) => i.id == sender.id);

      if (!isUserInDmHistory) {
        setDmHistoryUsers((prev) => [sender, ...prev]);
      }
    };
    const handleMessageRequests = ({ result, sender }) => {
      queryClient.setQueryData(
        ["initialChatData", String(sender.id)],
        (olderData) => ({
          ...olderData,
          dms: [result],
        })
      );
      console.log(dmHistoryUsers);

      setMsgRequests((prev) => ({
        ...prev,
        fromOthers: [...prev.fromOthers, result],
      }));

      const isUserInDmHistory = dmHistoryUsers.some(
        ({ id }) => id == sender.id
      );

      if (!isUserInDmHistory) setDmHistoryUsers((prev) => [sender, ...prev]);
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
  }, [dmHistoryUsers]);

  return (
    <>
      <div id="mainPanel" className="d-flex w-100">
        <Sidebar
          dmHistoryUsers={dmHistoryUsers}
          setDmHistoryUsers={setDmHistoryUsers}
          dmChat={dmChat}
          setDmChat={setDmChat}
        />
        <div className="d-flex flex-column border border-white border-opacity-25 border-start-0 border-end-0 w-100">
          <Outlet
            context={{
              groupChat,
              setGroupChat,
              dmChat,
              setDmChat,
              msgRequests,
              setMsgRequests,
              dmHistoryUsers,
              setDmHistoryUsers,
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
