import { Box, Divider, TextInput } from "@mantine/core";
import React from "react";
import { memo } from "react";

const GroupSettingsName = memo(function GroupSettingsName({
  groupName,
  setGroupState,
}) {
  return (
    <>
      <TextInput
        label={"Name"}
        value={groupName}
        onChange={(e) =>
          setGroupState((prev) => ({
            ...prev,
            group_name: e.target.value,
          }))
        }
      />
      <Divider color="gray.4" />
    </>
  );
});

export default GroupSettingsName;
