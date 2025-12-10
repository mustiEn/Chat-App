import { Box, Stack, Text } from "@mantine/core";
import React from "react";

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
    </>
  );
};

export default GroupChatLastJoins;
