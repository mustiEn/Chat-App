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

  return (
    <>
      <div className={`text-white flex-shrink-1 position-relative w-100`}>
        <DmList
          receiver={receiver}
          isInitialDataLoading={isInitialDataLoading}
        />
      </div>

      <MessageInput key={receiverId} />
    </>
  );
};

export default DmDisplay;
