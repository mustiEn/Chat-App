import React, { useEffect, useState, useContext } from "react";
import DmSidebarNav from "./DmSidebarNav";
import GroupChatSidebarNav from "./GroupChatSidebarNav";
import { useLocation } from "react-router-dom";
import { SidebarContext } from "../contexts/SidebarContext";
import DmSidebarNavTop from "./DmSidebarNavTop";
import DmHistory from "./DmHistory";

const Sidebar = ({ dmHistoryUsers, setDmHistoryUsers, dmChat, setDmChat }) => {
  const location = useLocation();
  // const [dmHistoryUsers, setDmHistoryUsers] = useState([]);

  return (
    <>
      <div
        id="sidebar"
        className="text-white align-items-center flex-shrink-0 border border-opacity-25 border-white border-end-0 d-flex flex-column rounded-start-4"
        style={{ backgroundColor: "#121214", width: 120 }}
      >
        {/* <SidebarContext value={value}> */}
        {location.pathname.includes("group-chat") ? (
          <GroupChatSidebarNav />
        ) : (
          <>
            <DmSidebarNavTop />
            <DmHistory
              dmHistoryUsers={dmHistoryUsers}
              setDmHistoryUsers={setDmHistoryUsers}
              dmChat={dmChat}
              setDmChat={setDmChat}
            />
          </>
        )}
        {/* </SidebarContext> */}
      </div>
    </>
  );
};

export default Sidebar;
