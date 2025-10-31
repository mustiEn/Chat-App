import React from "react";
import { LuDot } from "react-icons/lu";
import { useParams } from "react-router-dom";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Box, Button, Flex, Image, Text } from "@mantine/core";

const DmHeadProfile = () => {
  const { userId: receiverId } = useParams();
  const receiver = useReceiverStore((s) => s.receivers[receiverId]);

  return (
    <>
      <Box m={"xs"}>
        <Image
          src={receiver?.profile ? receiver.profile : "https://placehold.co/80"}
          radius={"100%"}
          w={80}
          h={80}
          alt=""
        />
        <Text
          style={{
            fontSize: 24,
          }}
        >
          {receiver?.display_name}
        </Text>
        <Text
          style={{
            fontSize: 20,
          }}
        >
          {receiver?.username}
        </Text>
        <Flex align={"center"} gap={"xs"}>
          <Text>No Mutual Groups</Text>
          <LuDot />
          <Button color="dark" size="sm">
            Add Friend
          </Button>
          <Button color="dark" size="sm">
            Block
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export default DmHeadProfile;
