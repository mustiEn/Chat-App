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
  const { recevierId } = useParams();
  const [isConnected, setIsConnected] = useState(socket.connected);

  return (
    <>
      <Box
        c={"white"}
        w={"100%"}
        style={{
          minHeight: 350,
        }}
      >
        <DmList key={recevierId} isInitialDataLoading={isInitialDataLoading} />
      </Box>

      <MessageInput key={recevierId} />
    </>
  );
};

export default DmDisplay;
