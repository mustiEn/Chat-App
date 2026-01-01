import { Stack, Text, Title } from "@mantine/core";
import React from "react";

const GroupHeadText = ({ serverName, msgExists }) => {
  return (
    <Stack>
      <Title>Welcome to</Title>
      <Title>{serverName}</Title>
      {msgExists && <Text>Its a bit silent here...</Text>}
    </Stack>
  );
};

export default GroupHeadText;
