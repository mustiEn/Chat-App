import GroupChatSidebarNav from "./GroupChatSidebarNav";
import { useLocation } from "react-router-dom";
import DmSidebarNavTop from "./DmSidebarNavTop";
import DmHistory from "./DmHistory";
import { Flex } from "@mantine/core";
import styles from "../css/sidebar.module.css";

const Sidebar = () => {
  const location = useLocation();

  return (
    <>
      <Flex
        w={300}
        c={"white"}
        bg={"#121214"}
        direction={"column"}
        align={"center"}
        className={styles["sidebar"]}
      >
        {location.pathname.includes("group-chat") ? (
          <GroupChatSidebarNav />
        ) : (
          <>
            <DmSidebarNavTop />
            <DmHistory />
          </>
        )}
      </Flex>
      {/* <div
        id="sidebar"
        className="text-white align-items-center flex-shrink-0 border border-opacity-25 border-white border-end-0 d-flex flex-column rounded-start-4"
        style={{ backgroundColor: "#121214", width: 300 }}
      >
        {location.pathname.includes("group-chat") ? (
          <GroupChatSidebarNav />
        ) : (
          <>
            <DmSidebarNavTop />
            <DmHistory />
          </>
        )}
      </div> */}
    </>
  );
};

export default Sidebar;
