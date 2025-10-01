import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../css/main_panel.css";
import Sidebar from "./Sidebar";
import { socket } from "../socket";

const MainPanel = () => {
  const [dmChat, setDmChat] = useState({
    messages: {},
    authenticatedUserId: socket.auth.userId,
    pendingMessages: {},
    pendingEditedMessages: {},
    pinnedMsgs: {},
    msgToReply: null,
    hasMoreUp: {},
    scrollPosition: {},
    receivers: {},
  });
  const [dmHistoryUsers, setDmHistoryUsers] = useState([]);
  const [groupChat, setGroupChat] = useState({});
  const scrollElementRef = useRef(null);
  const dmChatRef = useRef({
    scrollPosition: {},
    initialPageParam: {},
  });

  return (
    <>
      <div id="mainPanel" className="d-flex w-100">
        <Sidebar />
        <div className="d-flex flex-column border border-white border-opacity-25 border-start-0 border-end-0 w-100">
          <Outlet
            context={{
              groupChat,
              setGroupChat,
              dmChat,
              setDmChat,
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
