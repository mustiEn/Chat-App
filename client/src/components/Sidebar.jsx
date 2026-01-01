import { useLocation } from "react-router-dom";
import { Flex } from "@mantine/core";
import DmSidebar from "./DmSidebar";
import GroupChatSidebar from "./GroupChatSidebar";

const Sidebar = () => {
  const location = useLocation();

  return (
    <>
      <Flex
        // w={150}
        c={"white"}
        bg={"#121214"}
        direction={"column"}
        // className={styles["sidebar"]}
      >
        {location.pathname.includes("gc") ? (
          <GroupChatSidebar />
        ) : (
          <DmSidebar />
        )}
      </Flex>
    </>
  );
};

export default Sidebar;
