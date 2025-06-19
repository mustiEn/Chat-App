import React from "react";
import DmSidebarNav from "./DmSidebarNav";
import GroupChatSidebarNav from "./GroupChatSidebarNav";

const Sidebar = ({ path }) => {
  const renderSidebarNav = () => {
    return path.includes("group-chat") ? (
      <GroupChatSidebarNav />
    ) : (
      <DmSidebarNav />
    );
  };
  return (
    <>
      <div
        id="sidebar"
        className="text-white align-items-center border border-opacity-25 border-white border-end-0 d-flex flex-column rounded-start-4"
        style={{ backgroundColor: "#121214", minWidth: 400 }}
      >
        {renderSidebarNav()}
      </div>
    </>
  );
};

export default Sidebar;
