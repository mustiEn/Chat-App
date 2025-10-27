import { Modal } from "@mantine/core";
import React from "react";

const AppsModal = ({ opened, open, close }) => {
  return (
    <>
      <Modal opened={opened} onClose={close} title="Authentication">
        {/* Modal content */}
      </Modal>
    </>
  );
};

export default AppsModal;
