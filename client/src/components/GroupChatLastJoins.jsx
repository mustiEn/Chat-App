import { Box, Button, Stack, Text } from "@mantine/core";
import React from "react";
import { socket } from "../socket";

const GroupChatLastJoins = () => {
  return (
    <>
      <Box>
        <Text>Last Joins</Text>
        <Stack>
          {Array.from({ length: 4 }, (_, e) => (
            <Box key={e}>User: {e}</Box>
          ))}
        </Stack>
      </Box>
      <Button
        onClick={() => {
          socket.disconnect();
        }}
      >
        close
      </Button>
      <Button onClick={() => socket.connect()}>connect</Button>
    </>
  );
};

export default GroupChatLastJoins;
