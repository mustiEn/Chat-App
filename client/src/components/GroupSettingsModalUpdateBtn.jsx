import { Box, Button, Flex, Paper, Text, Transition } from "@mantine/core";
import React, { useEffect, useState } from "react";
import styles from "../css/group_settings_modal_update_btn.module.css";
import { useEditGroupMutation } from "../mutations/useEditGroupMutation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const GroupSettingsModalUpdateBtn = ({
  opened,
  formDataRef,
  groupState,
  close,
  resetGroupState,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient();
  const mutate = useEditGroupMutation(queryClient);

  const fadeDown = () => {
    close();
    setIsVisible(false);
    resetGroupState();
  };
  const submit = () => {
    const formData = formDataRef.current;

    formData.append("id", groupState.id);
    formData.append("description", groupState.description);
    formData.append("group_name", groupState.group_name);
    formData.append("group_icon", groupState.group_icon);
    formData.append("background_color", groupState.background_color);

    mutate.mutate(formData, {
      onSuccess: (data) => {
        toast.success("Group edited");
      },
    });
    fadeDown();
    formDataRef.current = new FormData();
  };

  useEffect(() => {
    if (opened) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [opened]);

  return (
    <>
      <Transition
        mounted={opened}
        transition="fade-up"
        duration={400}
        timingFunction="ease"
      >
        {(stylesT) => (
          <Paper
            style={stylesT}
            shadow="xl"
            bg={"#111111"}
            className={`${styles.box} ${!isVisible && styles["not-visible"]}`}
          >
            <Flex p="xs" gap={"xs"} align={"center"}>
              <Text>Careful - You have unsaved changes</Text>
              <Button variant="subtle" ms={"auto"} onClick={fadeDown}>
                Cancel
              </Button>
              <Button variant="outline" color="grape" onClick={submit}>
                Save
              </Button>
            </Flex>
          </Paper>
        )}
      </Transition>
    </>
  );
};

export default GroupSettingsModalUpdateBtn;
