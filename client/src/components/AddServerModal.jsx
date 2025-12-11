import { useDisclosure } from "@mantine/hooks";
import { Modal, Button, Center } from "@mantine/core";

const AddServerModal = ({ opened, open, close }) => {
  return (
    <>
      <Modal opened={opened} onClose={close} title="Create Your Server">
        <Center>
          <Text>
            Give your server a name and an icon. You can always change them
            later
          </Text>
        </Center>
      </Modal>
    </>
  );
};

export default AddServerModal;
