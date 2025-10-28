import { Box, Button, Flex, Text } from "@mantine/core";
import React from "react";
import { FaUsers } from "react-icons/fa6";
import { LuDot } from "react-icons/lu";
import { NavLink } from "react-router-dom";

const btns = [
  { to: "/@me/friends", name: "All" },
  { to: "online", name: "Online" },
  { to: "requests", name: "Requests" },
  { to: "add", name: "Add friend" },
];

const FriendsPanelTop = ({ props }) => {
  const [activeCompSetter, activeComp] = props;

  return (
    <>
      <Box className={"panel-top"}>
        <Flex
          h={"100%"}
          align={"center"}
          gap={"xs"}
          c={"white"}
          mr={10}
          ml={10}
        >
          <Flex align={"center"} gap={"sm"}>
            <FaUsers className="fs-5" />
            <Text fs={6}>Friends</Text>
          </Flex>
          <LuDot />
          {btns.map((e, i) => (
            <NavLink to={e.to} key={i} end>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "filled" : "outline"}
                  color="gray"
                  size="sm"
                >
                  {e.name}
                </Button>
              )}
            </NavLink>
          ))}
        </Flex>
      </Box>
    </>
  );
};

export default FriendsPanelTop;
