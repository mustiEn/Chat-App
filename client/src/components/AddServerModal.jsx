import { useDisclosure } from "@mantine/hooks";
import { Modal, Button } from "@mantine/core";

const AddServerModal = ({ opened, open, close }) => {
  return (
    <>
      <Modal opened={opened} onClose={close} title="Authentication">
        {/* Modal content */}
      </Modal>
    </>
  );
};

export default AddServerModal;
