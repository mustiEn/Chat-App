import React, { useEffect, useMemo, useRef } from "react";
import { useGroupMembers } from "../custom-hooks/useGroupMembers";
import { useParams } from "react-router-dom";
import { Text } from "@mantine/core";
import { PulseLoader } from "react-spinners";
import GroupMemberItem from "./GroupMemberItem";
import { useAuthUserStore } from "../stores/useAuthUserStore";
import { useVirtualizer } from "@tanstack/react-virtual";
import { generateUsers } from "../utils";
import styles from "../css/group_members.module.css";

const arrs = generateUsers();

const GroupMembers = ({ showOffset, setOnlineMembers }) => {
  const { groupId } = useParams();
  const { data, isLoading } = useGroupMembers(groupId);
  const scrollElementRef = useRef(null);
  const authUser = useAuthUserStore((s) => s.authUser);
  const members = useMemo(
    () =>
      data?.members.map((m) => {
        return m.id == authUser.id ? { ...m, status: authUser.status } : m;
      }) ?? [],
    [data, authUser.status]
  );

  const { items, onlineCount, offlineCount } = useMemo(() => {
    const onlineMembers = [];
    const offlineMembers = [];

    for (const m of arrs) {
      if (m.status === "Online") {
        if (!onlineMembers.length)
          onlineMembers.push({ id: null, label: "Online" });
        onlineMembers.push(m);
      } else {
        if (!offlineMembers.length)
          offlineMembers.push({ id: null, label: "Offline" });
        offlineMembers.push(m);
      }
    }

    const items = [...onlineMembers, ...offlineMembers];
    const onlineCount = onlineMembers.length;
    const offlineCount = offlineMembers.length;
    return { items, onlineCount, offlineCount };
  }, [members]);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 45,
    overscan: 5,
    gap: 3,
  });
  // console.log(items);

  return (
    <>
      <div
        color="white"
        className={`${styles["offCanvas"]} custom-scrollbar ${
          showOffset ? styles["show"] : ""
        }`}
        style={{
          flexShrink: 0,
          height: "100%",
          overflowY: "auto",
          padding: "1rem",
        }}
        id={"scrollableRef"}
        ref={scrollElementRef}
      >
        {isLoading ? (
          <PulseLoader color={"white"} />
        ) : (
          <div
            // gap={"2.5rem"}
            style={{
              position: "relative",
              height: rowVirtualizer.getTotalSize(),
            }}
            // p={"xl"}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];
              return (
                <>
                  <div
                    key={virtualRow.key}
                    w={"100%"}
                    top={0}
                    left={0}
                    style={{
                      width: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    data-index={virtualRow.index}
                  >
                    {item?.label ? (
                      <Text fw={600}>
                        {item.label} —{" "}
                        {item.label === "Online" ? onlineCount : offlineCount}
                      </Text>
                    ) : (
                      <GroupMemberItem member={item} />
                    )}
                  </div>
                </>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default GroupMembers;
