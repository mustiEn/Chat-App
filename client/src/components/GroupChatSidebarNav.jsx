import { Button, Modal, Stack } from "@mantine/core";
import GroupChatLastJoins from "./GroupChatLastJoins";
import { useDisclosure } from "@mantine/hooks";
import { useAuthUserStore } from "../stores/useAuthUserStore";
import GroupTerminationModal from "./GroupTerminationModal";
import GroupLeaveModal from "./GroupLeaveModal";
import GroupSettingsModal from "./GroupSettingsModal";

const GroupChatSidebarNav = ({ group }) => {
  const authUser = useAuthUserStore((s) => s.authUser);
  const isOwner = group?.created_by_id == authUser?.id;
  const [
    groupTerminationOpened,
    { open: openGroupTermination, close: closeGroupTermination },
  ] = useDisclosure(false);
  const [
    groupSettingsOpened,
    { open: openGroupSettings, close: closeGroupSettings },
  ] = useDisclosure(false);
  const [groupLeaveOpened, { open: openGroupLeave, close: closeGroupLeave }] =
    useDisclosure(false);

  return (
    <>
      <Stack w={"100%"}>
        <Button onClick={openGroupSettings}>Group Settings</Button>
        <Button>Mute group</Button>
        <Button onClick={isOwner ? openGroupTermination : openGroupLeave}>
          {isOwner ? "Delete group" : "Leave group"}
        </Button>
      </Stack>
      <GroupChatLastJoins />
      {group?.id && (
        <GroupSettingsModal
          groupSettingsOpened={groupSettingsOpened}
          closeGroupSettings={closeGroupSettings}
          group={group}
        />
      )}
      {group?.id && isOwner && (
        <GroupTerminationModal
          group={group}
          groupTerminationOpened={groupTerminationOpened}
          closeGroupTermination={closeGroupTermination}
        />
      )}
      {group?.id && !isOwner && (
        <GroupLeaveModal
          group={group}
          groupLeaveOpened={groupLeaveOpened}
          closeGroupLeave={closeGroupLeave}
        />
      )}
    </>
  );
};

export default GroupChatSidebarNav;
