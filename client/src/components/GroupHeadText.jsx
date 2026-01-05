import { Image, Stack, Text, Title } from "@mantine/core";
import React from "react";

const GroupHeadText = ({ serverName, msgExists, image }) => {
  return (
    <Stack mt={msgExists ? "sm" : "8rem"} align="center" mb={"md"}>
      <Image
        src={image ?? "https://placehold.co/120"}
        w={120}
        h={120}
        radius={"100%"}
      />
      <Title>Welcome to</Title>
      <Title>{serverName}</Title>
      {!msgExists && <Text>Its a bit silent here...</Text>}
    </Stack>
  );
};

export default GroupHeadText;
