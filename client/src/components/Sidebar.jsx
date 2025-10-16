import GroupChatSidebarNav from "./GroupChatSidebarNav";
import { useLocation } from "react-router-dom";
import DmSidebarNavTop from "./DmSidebarNavTop";
import DmHistory from "./DmHistory";

const Sidebar = ({ dmChat, setDmChat }) => {
  const location = useLocation();

  return (
    <>
      <div
        id="sidebar"
        className="text-white align-items-center flex-shrink-0 border border-opacity-25 border-white border-end-0 d-flex flex-column rounded-start-4"
        style={{ backgroundColor: "#121214", width: 120 }}
      >
        {location.pathname.includes("group-chat") ? (
          <GroupChatSidebarNav />
        ) : (
          <>
            <DmSidebarNavTop />
            <DmHistory dmChat={dmChat} setDmChat={setDmChat} />
          </>
        )}
      </div>
    </>
  );
};

export default Sidebar;
