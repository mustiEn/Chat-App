import { Flex, Stack, Title } from "@mantine/core";
import React from "react";
import { PulseLoader } from "react-spinners";

const AuthUserFallback = () => {
  return (
    <Flex w={"100%"} h={"100%"} justify={"center"} align={"center"}>
      <Stack align="center">
        <Title>User authenticating...</Title>
        <PulseLoader color="white" />
      </Stack>
    </Flex>
  );
};

export default AuthUserFallback;
