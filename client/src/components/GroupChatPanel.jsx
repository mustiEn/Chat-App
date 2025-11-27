import React, { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Box, Text } from "@mantine/core";

const GroupChatPanel = () => {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: 100,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  return (
    <>
      <Text c="white" fz="xl">
        GroupChatPanel
      </Text>

      <Box
        ref={parentRef}
        color="white"
        style={{
          height: 900,
          overflow: "auto",
        }}
      >
        <Box
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${
                rowVirtualizer.getVirtualItems()[0]?.start ?? 0
              }px)`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
              <Box
                key={virtualRow.key}
                style={{
                  width: "100%",
                }}
                data-index={virtualRow.index}
                ref={virtualRow.measureElement}
                mt="md"
              >
                Row{" "}
                {virtualRow.index % 2 === 0
                  ? virtualRow.index + " row lorem 🧠 "
                  : virtualRow.index}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default GroupChatPanel;
