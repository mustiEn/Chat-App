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
    </>
  );
};

export default Sidebar;
