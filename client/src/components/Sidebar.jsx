import GroupChatSidebarNav from "./GroupChatSidebarNav";
import { useLocation } from "react-router-dom";
import DmSidebarNavTop from "./DmSidebarNavTop";
import DmHistory from "./DmHistory";
import { Box, Button, Flex } from "@mantine/core";
import styles from "../css/sidebar.module.css";

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
        {location.pathname.includes("group-chat") ? (
          <Box className={styles.sidebar}>
            <GroupChatSidebarNav />
          </Box>
        ) : (
          <>
            <Flex
              align={"center"}
              justify={"center"}
              className={`${styles["conversation-btn"]}`}
            >
              <Button
                // mt={10}
                // mb={10}
                // mr={10}
                // ml={10}
                variant={"filled"}
                radius={"sm"}
                color="dark"
                w={"90%"}
              >
                Find or start a conversation
              </Button>
            </Flex>
            <Flex
              direction={"column"}
              align={"center"}
              className={`${styles["sidebar"]} ${styles["dm-sidebar"]}  custom-scrollbar`}
              mb={"sm"}
              h={"100%"}
            >
              <DmSidebarNavTop />
              <DmHistory />
            </Flex>
          </>
        )}
      </Flex>
    </>
  );
};

export default Sidebar;
