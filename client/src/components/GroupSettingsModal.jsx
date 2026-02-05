import { Modal } from "@mantine/core";

import GroupSettingsModalContent from "./GroupSettingsModalContent";

const GroupSettingsModal = ({
  groupSettingsOpened,
  closeGroupSettings,
  group,
}) => {
  return (
    <>
      <Modal
        opened={groupSettingsOpened}
        onClose={closeGroupSettings}
        title={"Group Settings"}
        size={"70%"}
        // centered
        styles={{
          title: {
            fontSize: "var(--mantine-h4-font-size)",
            fontWeight: "bold",
          },
          body: {
            height: 700,
            overflow: "hidden",
          },
          content: {
            overflow: "hidden",
          },
        }}
      >
        <GroupSettingsModalContent group={group} />
      </Modal>
    </>
  );
};

export default GroupSettingsModal;
