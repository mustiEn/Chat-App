import { Button, Modal, Stack } from "@mantine/core";
import React from "react";
import GroupChatLastJoins from "./GroupChatLastJoins";
import { useDisclosure } from "@mantine/hooks";

const GroupChatSidebarNav = () => {
  const isOwner = 1;
  const [
    serverTerminationOpened,
    { open: openServerTermination, close: closeServerTermination },
  ] = useDisclosure(false);
  const [
    serverSettingsOpened,
    { open: openServerSettings, close: closeServerSettings },
  ] = useDisclosure(false);

  return (
    <>
      <Stack w={"100%"}>
        <Button onClick={openServerSettings}>Server Settings</Button>
        <Button>Mute server</Button>
        <Button onClick={openServerTermination}>
          {isOwner ? "Delete group" : "Leave group"}
        </Button>
      </Stack>
      <GroupChatLastJoins />
      <Modal
        opened={serverSettingsOpened}
        onClose={closeServerSettings}
        title="Server Settings"
      >
        {/* Modal content */}
      </Modal>
      <Modal
        opened={serverTerminationOpened}
        onClose={closeServerTermination}
        title="Termination"
      >
        {/* Modal content */}
      </Modal>
    </>
  );
};

export default GroupChatSidebarNav;
