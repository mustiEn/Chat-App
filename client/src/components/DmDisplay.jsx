import { socket } from "../socket.js";
import { useParams } from "react-router-dom";
import { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import DmList from "./DmList.jsx";
import MessageInput from "./MessageInput.jsx";
import { Box } from "@mantine/core";

dayjs.extend(utc);
dayjs.extend(timezone);

const DmDisplay = ({ isInitialDataLoading }) => {
  const { userId: receiverId } = useParams();
  const [isConnected, setIsConnected] = useState(socket.connected);

  return (
    <>
      <Box
        c={"white"}
        w={"100%"}
        style={{
          flexShrink: 1,
          position: "relative",
        }}
      >
        <DmList key={receiverId} isInitialDataLoading={isInitialDataLoading} />
      </Box>

      <MessageInput key={receiverId} />
    </>
  );
};

export default DmDisplay;
