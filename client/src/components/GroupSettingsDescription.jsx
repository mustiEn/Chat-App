import { Textarea } from "@mantine/core";
import React from "react";
import { memo } from "react";

const GroupSettingsDescription = memo(function GroupSettingsDescription({
  groupDesc,
  setGroupState,
}) {
  const setDescription = (e) => {
    if (groupDesc.length > 175) return;

    const val = e.target.value;

    setGroupState((prev) => ({
      ...prev,
      description: val == "" ? null : val,
    }));
  };

  return (
    <>
      <Textarea
        label={"Description"}
        description={
          "How did your group get started ? Why should people join ?"
        }
        placeholder="Fancy a paragraph ?"
        value={groupDesc ?? ""}
        onChange={(e) => setDescription(e)}
        autosize
        minRows={2}
        maxRows={4}
      />
    </>
  );
});

export default GroupSettingsDescription;
