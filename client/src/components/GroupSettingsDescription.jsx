import { Textarea } from "@mantine/core";
import React from "react";
import { memo } from "react";

const GroupSettingsDescription = memo(function GroupSettingsDescription({
  groupDesc,
  setGroupState,
}) {
  const setDescription = (e) => {
    const val = e.target.value;
    const slicedVal = val.length > 175 ? val.slice(0, 175) : val;
    console.log(slicedVal.length);

    if (slicedVal > 175) return;

    setGroupState((prev) => ({
      ...prev,
      description: slicedVal == "" ? null : slicedVal,
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
