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
    fromOthers: {},
    fromMe: {},
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
    const onDisconnect = () => {
      console.log("❌ Socket disconnected");
    };
    const handleEditedMessages = ({ result }) => {
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
    const handleMessageRequests = ({ result, sender }) => {
      queryClient.setQueryData(
        ["initialChatData", String(sender.id)],
        (olderData) => ({
          ...olderData,
          dms: [result],
        })
      );
      console.log(sender);

      setMsgRequests((prev) => ({
        ...prev,
        fromOthers: { ...prev.fromOthers, [sender.id]: [result] },
      }));
      setDmHistoryUsers((prev) => [sender, ...prev]);
    };
    const handlePinnedMessages = ({ result, isPinned }) => {
      if (isPinned != "recovery") {
        const [pinnedMsg] = result;
        const pinnedById = pinnedMsg.pinned_by_id;

        const isQueryFetched = queryClient.getQueryState([
          "initialChatData",
          String(pinnedById),
        ]);

        //^ here, add a notification and amend if needed.if notification is here,no need to check ispinned, cuz now i cant know whether to notify on mount
        if (isPinned) {
          setDmChat((prev) => ({
            ...prev,
            newPinnedMsgExists: {
              ...prev.newPinnedMsgExists,
              [pinnedById]: prev.showPinnedMsgs[pinnedById] ? false : true, //* if the modal is open,dont notify the user, if not, do it
            },
          }));
        }
        if (!isQueryFetched) return; //* if not already fetch,skip since its gonna fetch it on mount

        queryClient.setQueryData(
          ["initialChatData", String(pinnedById)],
          (olderData) => {
            if (isPinned) {
              return [pinnedMsg, ...olderData];
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
          const pinnedById = pinnedMsg.pinned_by_id;
          const isQueryFetched = queryClient.getQueryState([
            "initialChatData",
            String(pinnedById),
          ]);

          //^ notification thing applies to this here too.
          if (isPinned) {
            const pinnedById = pinnedMsg.pinned_by_id;

            setDmChat((prev) => ({
              ...prev,
              newPinnedMsgExists: {
                ...prev.newPinnedMsgExists,
                [pinnedById]: prev.showPinnedMsgs[pinnedById] ? false : true, //* if the modal is open,dont notify the user, if not, do it
              },
            }));
          }
          if (!isQueryFetched) return; //* if not already fetch,skip since its gonna fetch it on mount

          queryClient.setQueryData(
            ["initialChatData", String(pinnedById)],
            (olderData) => {
              if (isPinned) {
                const pinnedMsgAlreadyExists = olderData.find(
                  ({ id }) => id == pinnedMsg.id
                );

                if (pinnedMsgAlreadyExists) {
                  olderData.filter((e) => e.id != pinnedMsg.id);
                }

                return [pinnedMsg, ...olderData];
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
    socket.on("receive msg requests", handleMessageRequests);
    socket.on("receive edited msgs", handleEditedMessages);
    socket.on("receive pinned msgs", handlePinnedMessages);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectErr);
      socket.off("initial", getInitial);
      socket.off("receive edited msgs", handleEditedMessages);
      socket.off("receive dms", handleNewMessages);
      socket.off("receive msg requests", handleMessageRequests);
      socket.off("receive pinned msgs", handlePinnedMessages);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();

      queryClient.removeQueries();
      console.log("SOCKET DISCONNECTED layout");
    };
  }, []);

  useEffect(() => {
    const receiveMessageRequestAcceptance = (sender, msg) => {
      console.log("receiveMessageRequestAcceptance func runnning");
      socket.emit("join room", sender.id);

      const state = queryClient.getQueryState([
        "initialChatData",
        String(sender.id),
      ]);
      //^ This is to keep cache empty if undefined cuz on dmpanel mount,its already gonna comeup
      if (state && Object.keys(msg).length) {
        queryClient.setQueryData(
          ["initialChatData", String(sender.id)],
          (olderData) => ({
            ...olderData,
            dms: [...(olderData?.dms ?? []), msg],
          })
        );
      }

      setMsgRequests((prev) => {
        const { [sender.id]: _, ...filtered } = prev.fromMe;

        return {
          fromMe: filtered,
          fromOthers: prev.fromOthers,
        };
      });

      const isUserInDmHistory = dmHistoryUsers.some((i) => i.id == sender.id);

      if (!isUserInDmHistory) {
        setDmHistoryUsers((prev) => [sender, ...prev]);
      }
    };
    socket.on(
      "receive msg request acceptance",
      receiveMessageRequestAcceptance
    );

    return () => {
      socket.off(
        "receive msg request acceptance",
        receiveMessageRequestAcceptance
      );
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
