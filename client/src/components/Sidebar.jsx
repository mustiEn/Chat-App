import React from "react";
import DmSidebarNav from "./DmSidebarNav";
import GroupChatSidebarNav from "./GroupChatSidebarNav";

const Sidebar = ({ path }) => {
  console.log(path);

  const renderSidebarNav = () => {
    return path.slice(-3) == "@me" ? <DmSidebarNav /> : <GroupChatSidebarNav />;
  };
  return (
    <>
      <div
        id="sidebar"
        className="text-white align-items-center border border-end-0 d-flex flex-column rounded-start-4"
        style={{ backgroundColor: "#121214", width: 400 }}
      >
        {renderSidebarNav()}
      </div>
    </>
  );
};

export default Sidebar;
