import React from "react";
import { useDisclosure } from "@mantine/hooks";
import { Popover } from "@mantine/core";
import { memo } from "react";

const PopoverComponent = memo(function PopoverComponent({
  content,
  trigger,
  position = "right",
}) {
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <Popover position={position} withArrow shadow="md" opened={opened}>
      <Popover.Target onMouseEnter={open} onMouseLeave={close}>
        {trigger}
      </Popover.Target>
      <Popover.Dropdown style={{ pointerEvents: "none" }}>
        {content}
      </Popover.Dropdown>
    </Popover>
  );
});

export default PopoverComponent;
