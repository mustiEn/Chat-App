import React from "react";
import DmHistory from "./DmHistory";
import DmSidebarNavTop from "./DmSidebarNavTop";
import { Button, Flex } from "@mantine/core";
import styles from "../css/sidebar.module.css";
import dmSidebarStyles from "../css/dm_sidebar.module.css";

const DmSidebar = () => {
  return (
    <>
      <Flex
        align={"center"}
        justify={"center"}
        className={`${styles["sidebar-top"]}`}
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
        className={`${styles["sidebar"]} ${dmSidebarStyles["dm-sidebar"]}  custom-scrollbar`}
        mb={"sm"}
        px={"sm"}
        py={"sm"}
        h={"100%"}
      >
        <DmSidebarNavTop />
        <DmHistory />
      </Flex>
    </>
  );
};

export default DmSidebar;
