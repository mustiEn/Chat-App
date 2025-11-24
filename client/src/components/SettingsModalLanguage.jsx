import { Button, Flex, Modal, Stack, Text } from "@mantine/core";
import React from "react";
import { useDisclosure } from "@mantine/hooks";

const SettingsModalSecurity = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <div>Language</div>
      <Stack></Stack>
    </>
  );
};

export default SettingsModalSecurity;
