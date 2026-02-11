import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { removeGroup } from "../utils/groups";
import { PulseLoader } from "react-spinners";

const GroupLeaveModal = ({ group, groupLeaveOpened, closeGroupLeave }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeaveGroup = () => {
    if (!socket.connected) {
      toast.error("We couldnt delete the group");
      return;
    }
    const groupId = group?.group_id;

    setIsLeaving(true);
    socket.emit("leave group", groupId, (err, res) => {
      if (err) {
        console.log("Error: ", err);
        toast.error(err);
        return;
      }

      removeGroup(queryClient, groupId);
      navigate("/@me/friends");
    });
  };

  useEffect(() => {
    if (!isLeaving) return;

    const handler = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    document.body.addEventListener("click", handler, true); // capture phase

    return () => {
      document.body.removeEventListener("click", handler, true);
    };
  }, [isLeaving]);

  return (
    <>
      <Modal
        opened={groupLeaveOpened}
        onClose={closeGroupLeave}
        title={`Leave '${group.group_name}'`}
        centered
        styles={{
          title: {
            fontSize: "var(--mantine-h4-font-size)",
            fontWeight: "bold",
          },
        }}
      >
        <Text className="text-muted">
          Are you sure you want to leave{" "}
          <span
            style={{
              color: "var(--mantine-color-gray-5)",
              fontWeight: "bold",
            }}
          >
            {group.group_name}
          </span>
          ? You wont be able to rejoin this server unless you're reinvited.
        </Text>
        <Group mt={"md"} wrap="nowrap">
          <Button w={"50%"} color="gray" onClick={closeGroupLeave}>
            Cancel
          </Button>
          <Button w={"50%"} color="red" onClick={handleLeaveGroup}>
            {isLeaving ? <PulseLoader color="white" /> : "Delete"}
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default GroupLeaveModal;
