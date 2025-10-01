import { socket } from "../socket.js";
import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DmList from "./DmList.jsx";
import MessageInput from "./MessageInput.jsx";

dayjs.extend(utc);
dayjs.extend(timezone);

const DmDisplay = ({ receiver, isInitialDataLoading }) => {
  const { userId: receiverId } = useParams();
  const { setDmChat } = useOutletContext();
  const [isConnected, setIsConnected] = useState(socket.connected);

  const handleDeletedMessage = ({ result: deletedMsgs }) => {};
  const onConnect = () => {
    setIsConnected(true);
  };

  useEffect(() => {
    onConnect();
    const handleNewMessage = ({ result, wasDisconnected }) => {
      // console.log("msg arrived");
      if (wasDisconnected) {
        // console.log("was disconnected");
        const [msg] = result;
        setDmChat((prev) => {
          const pendingMessages = prev.pendingMessages[receiverId].length
            ? prev.pendingMessages[receiverId].filter(
                (m) => m.clientOffset !== msg.clientOffset
              )
            : [];

          return {
            ...prev,
            pendingMessages: {
              ...prev.pendingMessages,
              [receiverId]: pendingMessages,
            },
            messages: {
              ...prev.messages,
              [receiverId]: [
                ...prev.messages[receiverId],
                { ...msg, isPending: false },
              ],
            },
          };
        });
      } else {
        // console.log("wasnt disocnnected");
        setDmChat((prev) => ({
          ...prev,
          messages: {
            ...prev.messages,
            [receiverId]: [...(prev.messages[receiverId] ?? []), ...result],
          },
        }));
      }
      // console.log(
      //   "socket.auth.serverOffset before: ",
      //   socket.auth.serverOffset
      // );
      socket.auth.serverOffset = result[0]?.id ?? socket.auth.serverOffset;
      // console.log("socket.auth.serverOffset after: ", socket.auth.serverOffset);
    };
    const handleEditedMessage = ({ result: editedMsgs }) => {
      setDmChat((prev) => {
        const messagesMap = new Map(
          prev.messages[receiverId]?.map((m) => [m.id, m])
        );

        editedMsgs.forEach(({ id, message }) => {
          const exists = messagesMap.has(id);

          if (exists) {
            let existingMsg = messagesMap.get(id);

            existingMsg = {
              ...existingMsg,
              message: message,
              isPending: false,
            };
            messagesMap.set(id, existingMsg);
          }
        });

        return {
          ...prev,
          messages: {
            ...prev.messages,
            [receiverId]: Array.from(messagesMap.values()),
          },
        };
      });
    };

    socket.emit("join room", receiverId, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Joined room");
      }
    });
    socket.on("receive dms", handleNewMessage);
    socket.on("receive edited msgs", handleEditedMessage);
    socket.auth.receiverId = receiverId;

    return () => {
      socket.off("receive dms", handleNewMessage);
      socket.off("receive edited msgs", handleEditedMessage);
      socket.emit("leave room", receiverId, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Left room");
        }
      });
    };
  }, []);

  return (
    <>
      <div className={`text-white flex-shrink-1 position-relative w-100`}>
        <DmList
          receiver={receiver}
          isInitialDataLoading={isInitialDataLoading}
        />
      </div>

      <MessageInput />
    </>
  );
};

export default DmDisplay;
