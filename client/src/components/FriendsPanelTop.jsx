import { Box, Button, Flex, Text } from "@mantine/core";
import React from "react";
import { FaUsers } from "react-icons/fa6";
import { LuDot } from "react-icons/lu";

const btns = [{ name: "Online" }, { name: "All" }, { name: "Add friend" }];

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
          {btns.map((btn, i) => (
            <Button
              key={i}
              variant={activeComp == i ? "filled" : "outline"}
              color={"gray"}
              size="sm"
              // className={activeComp == i ? "active" : ""}
              onClick={() => activeCompSetter(i)}
            >
              {btn.name}
            </Button>
          ))}
        </Flex>
      </Box>
    </>
  );
};

export default FriendsPanelTop;
