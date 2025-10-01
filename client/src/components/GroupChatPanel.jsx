import React, { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const GroupChatPanel = () => {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: 100,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  return (
    <>
      <div className="text-white fs-3">GroupChatPanel</div>

      <div
        ref={parentRef}
        className="text-white"
        style={{
          height: 900,
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(),
            position: "relative",
          }}
        >
          <div
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
              <div
                key={virtualRow.key}
                style={{
                  // position: "absolute",
                  width: "100%",
                  // top: 0,
                  // left: 0,
                  // transform: `translateY(${virtualRow.start}px)`,
                }}
                data-index={virtualRow.index}
                ref={virtualRow.measureElement}
                className="mt-3"
              >
                Row
                {virtualRow.index % 2 == 0
                  ? virtualRow.index + " row lorem 🧠 "
                  : virtualRow.index}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupChatPanel;
