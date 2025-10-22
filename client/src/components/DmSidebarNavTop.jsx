import React, { useContext } from "react";
import { FaUsers } from "react-icons/fa6";
import { IoMdStarOutline } from "react-icons/io";
import { AiOutlineShop } from "react-icons/ai";
import { FaRegEnvelope } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import HeaderContext from "../contexts/HeaderContext";
import { Stack, Button, Flex, Text, Box } from "@mantine/core";
import styles from "../css/dm_sidebar_nav_top.module.css";

const links = [
  { content: "Friends", icon: <FaUsers />, link: "/@me" },
  { content: "Bots", icon: <IoMdStarOutline />, link: "bots" },
  { content: "Shop", icon: <AiOutlineShop />, link: "shop" },
  { content: "Requests", icon: <FaRegEnvelope />, link: "requests" },
];

const DmSidebarNavTop = () => {
  const setHeader = useContext(HeaderContext);

  return (
    <>
      <Box w={"100%"}>
        <Button
          mt={10}
          mb={10}
          mr={10}
          ml={10}
          variant={"filled"}
          radius={"sm"}
          color="dark"
        >
          Find or start a conversation
        </Button>
        <Box className={styles["div-border"]}>
          <Stack gap={"xs"} mt={"xs"} mb={"xs"} mr={"sm"} ml={"sm"}>
            {links.map((link, i) => (
              <NavLink
                key={i}
                to={link.link}
                onClick={() => setHeader(link.content)}
                end
              >
                <Button
                  variant={"filled"}
                  color="dark"
                  justify="flex-start"
                  radius={"sm"}
                  w={"100%"}
                >
                  <Flex align={"center"} gap={3}>
                    <Box fz={"h5"}>{link.icon}</Box>
                    <Text>{link.content}</Text>
                  </Flex>
                </Button>
              </NavLink>
            ))}
          </Stack>
        </Box>
        {/* <hr className="text-white mx-2" /> */}
      </Box>
    </>
  );
};

export default DmSidebarNavTop;
