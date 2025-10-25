import React from "react";
import { TbDotsVertical, TbMessageCircle } from "react-icons/tb";
import FriendsPanelTop from "./FriendsPanelTop";
import { Box, Flex, Image, Stack, Text } from "@mantine/core";
// import "../css/friends.css";
const OnlineFriends = () => {
  return (
    <>
      {/* <FriendsPanelTop /> */}
      <Text
        mx={"xs"}
        pb={"xs"}
        style={{
          border: "1px solid rgba(255,255,255,25%)",
          borderWidth: "0 0 1px 0",
        }}
      >
        All friends - 9
      </Text>
      <Stack mx={"xs"} color="white" gap={5}>
        {Array.from({ length: 9 }, (_, i) => (
          <Flex
            key={i}
            className="online-friends"
            align={"center"}
            p={"xs"}
            gap={"xs"}
            style={{
              border: "1px solid rgba(255,255,255,25%)",
              borderWidth: "0 0 1px 0",
            }}
          >
            <Image
              src="https://placehold.co/32"
              w={32}
              h={32}
              radius={"xl"}
              alt=""
            />
            <Flex direction={"column"}>
              <Text fw={"bold"} fz={16}>
                Jack Micheal
              </Text>
              <Text fz={14}>online</Text>
            </Flex>
            <TbMessageCircle className="ms-auto" style={{ fontSize: 25 }} />
            <TbDotsVertical style={{ fontSize: 25 }} />
          </Flex>
        ))}
      </Stack>
    </>
  );
};

export default OnlineFriends;
