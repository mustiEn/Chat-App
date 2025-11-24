import { Button, Flex, Modal, Stack, Text } from "@mantine/core";
import React from "react";
import { useDisclosure } from "@mantine/hooks";

const SettingsModalSecurity = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Stack>
        <Stack>
          <Flex>
            <Text>Change Password</Text>
            <Button color={"dark"} ms={"auto"}>
              Edit
            </Button>
          </Flex>
          <Flex>
            <Text>Authenticator app</Text>
            <Button color={"dark"} ms={"auto"}>
              Enable authenticator
            </Button>
          </Flex>
          <Flex>
            <Text>Security keys</Text>
            <Button color={"dark"} ms={"auto"}>
              Security keys
            </Button>
          </Flex>
          <Flex>
            <Text>Accunt removal</Text>
            <Button color={"dark"} ms={"auto"}>
              disable account
            </Button>
          </Flex>
        </Stack>
      </Stack>
    </>
  );
};

export default SettingsModalSecurity;
