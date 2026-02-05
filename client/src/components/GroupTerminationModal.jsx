import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { removeGroup } from "../utils/groups";

const GroupTerminationModal = ({
  groupTerminationOpened,
  closeGroupTermination,
  group,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirmName, setConfirmName] = useState("");
  const [validated, setValidated] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isValid = confirmName === group?.group_name;

  const handleDeleteGroup = () => {
    if (!socket.connected) {
      toast.error("We couldnt delete the group");
      return;
    }

    const groupId = group?.group_id;
    socket.emit("send group deleted", groupId, (err, res) => {
      if (err) {
        console.log("Error: ", err);
        toast.error(err);
        return;
      }

      socket.emit("leave group", groupId);
      removeGroup(queryClient, groupId);

      navigate("/@me/friends");
    });
  };
  const resetField = () => {
    setValidated(false);
    setConfirmName("");
  };
  const validateField = () => {
    setValidated(true);
    if (isValid) {
      setIsDeleting(true);
      handleDeleteGroup();
    }
  };

  useEffect(() => {
    if (!isDeleting) return;
    const handler = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    document.body.addEventListener("click", handler, true); // capture phase

    return () => {
      document.body.removeEventListener("click", handler, true);
    };
  }, [isDeleting]);

  return (
    <>
      <Modal
        opened={groupTerminationOpened}
        onClose={closeGroupTermination}
        title={`Delete '${group.group_name}'`}
        centered
        styles={{
          title: {
            fontSize: "var(--mantine-h4-font-size)",
            fontWeight: "bold",
          },
        }}
      >
        <Text className="text-muted">
          Are you sure you want to delete{" "}
          <span
            style={{
              color: "var(--mantine-color-gray-5)",
              fontWeight: "bold",
            }}
          >
            {group.group_name}
          </span>
          ? This cannot be undone
        </Text>
        <TextInput
          label="Your group name"
          value={confirmName}
          onChange={(e) => {
            setConfirmName(e.currentTarget.value);
            setValidated(false);
          }}
          error={validated && !isValid ? "The server name doesn't match" : null}
          mt={"md"}
        />
        <Group mt={"md"} wrap="nowrap">
          <Button
            w={"50%"}
            color="gray"
            onClick={() => {
              closeGroupTermination();
              resetField();
            }}
          >
            Cancel
          </Button>
          <Button w={"50%"} color="red" onClick={validateField}>
            {isDeleting ? <PulseLoader color="white" /> : "Delete"}
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default GroupTerminationModal;
