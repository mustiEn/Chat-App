import React, { useState, useContext, useEffect, useMemo } from "react";
import MsgItem from "./MsgItem.jsx";
import { PulseLoader } from "react-spinners";
import { useOutletContext, useParams } from "react-router-dom";
import InfiniteLoader from "./InfiniteLoader.jsx";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect } from "react";
import ChatSkeleton from "./ChatSkeleton.jsx";
import { useHasMoreUpStore } from "../stores/useHasMoreUpStore.js";
import { usePendingMsgStore } from "../stores/usePendingMsgStore.js";
import { Box } from "@mantine/core";
import { useGroupMessages } from "../custom-hooks/useGroupMessages.js";
import GroupHeadText from "./GroupHeadText.jsx";
import { useInView } from "react-intersection-observer";
import { socket } from "../socket.js";
import { useGroups } from "../custom-hooks/useGroups.js";

const GroupMessageList = () => {
  const { groupId } = useParams();
  const { data: groups } = useGroups();
  const group = groups?.find(({ group_id }) => group_id === groupId) ?? [];
  const { scrollElementRef, groupChatRef } = useOutletContext();

  const pendingMsgs = usePendingMsgStore((s) => s.pendingMsgs.group);
  const addToHasMoreUp = useHasMoreUpStore((s) => s.addToGroupHasMoreUp);
  const hasMoreUp = useHasMoreUpStore((s) => s.hasMoreUp.group);

  const {
    scrollPosition,
    prevTopId,
    groupPanel: { groupMessagesTopId },
    msgAddedOrDeleted,
  } = groupChatRef.current;
  const {
    data: groupMessages,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useGroupMessages(groupId);

  const reversed = groupMessages && groupMessages.pages.toReversed();
  const messages = reversed?.flatMap(({ messages }) => messages) ?? [];
  const pending = pendingMsgs[groupId];
  const items = pending?.length ? [...messages, ...pending] : messages;

  const rowVirtualizer = useVirtualizer({
    count: items.length ?? 0,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 80,
    overscan: 2,
    gap: 5,
  });
  const { ref, inView } = useInView({
    threshold: 0.6,
  });

  useEffect(() => {
    const el = scrollElementRef.current;

    if (!el) return;

    const handleScroll = () => {
      scrollPosition[groupId] = el.scrollTop;
    };

    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      // console.log("scerollposition", scrollPosition);
    };
  }, [scrollElementRef.current, groupId]);

  useLayoutEffect(() => {
    const el = scrollElementRef.current;

    if (!items.length || !el) return;

    const latestTopId = items[0].id;
    const newMsgsLoaded =
      groupMessagesTopId[groupId] &&
      groupMessagesTopId[groupId] !== latestTopId;
    const isNearBottom = rowVirtualizer.range.endIndex >= items.length - 4;

    if (scrollPosition[groupId] === undefined) {
      el.scrollTop = el.scrollHeight;
      scrollPosition[groupId] = el.scrollTop;
      addToHasMoreUp(groupId, hasNextPage);
    } else if (newMsgsLoaded) {
      const index = items.findIndex(({ id }) => id == prevTopId[groupId]);

      addToHasMoreUp(groupId, hasNextPage);
      rowVirtualizer.scrollToIndex(index, {
        align: "center",
        behavior: "smooth",
      });
    } else if (isNearBottom && msgAddedOrDeleted[groupId]) {
      el.scrollTo({ top: el.scrollHeight + 20, behavior: "smooth" });
      msgAddedOrDeleted[groupId] = false;
    }
    // else {
    //   console.log("not new");

    //   el.scrollTop = scrollPosition[groupId];
    // }

    socket.auth.serverOffset.groups[groupId] = messages.at(-1)?.id ?? 0;
    groupMessagesTopId[groupId] = latestTopId;
  }, [items]);

  useLayoutEffect(() => {
    const el = scrollElementRef.current;

    if (!el) return;
    el.scrollTop = scrollPosition[groupId];
  }, []);

  useEffect(() => {
    if (hasMoreUp[groupId] && inView) {
      const el = scrollElementRef.current;

      prevTopId[groupId] = messages.at(0)?.id;
      scrollPosition[groupId] = el.scrollTop;

      fetchNextPage();
    }
  }, [inView]);

  return (
    <>
      {isLoading ? (
        <ChatSkeleton />
      ) : (
        <InfiniteLoader
          next={fetchNextPage}
          loader={<PulseLoader color={"white"} />}
        >
          {!messages.length ? (
            <GroupHeadText
              serverName={group?.group_name}
              msgExists={false}
              image={group?.group_icon}
            />
          ) : (
            !hasMoreUp[groupId] && (
              <GroupHeadText
                serverName={group?.group_name}
                msgExists={true}
                image={group?.group_icon}
              />
            )
          )}
          {hasMoreUp[groupId] && messages.length && (
            <Box mb={"xl"} ref={ref}>
              <PulseLoader color={"white"} />
            </Box>
          )}
          <Box
            h={rowVirtualizer.getTotalSize()}
            style={{
              position: "relative",
              minHeight: 355,
            }}
            p={"xs"}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];
              return (
                <Box
                  key={virtualRow.key}
                  w={"100%"}
                  top={0}
                  left={0}
                  style={{
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                >
                  {/* <Box w={"100%"} p={"xs"}>
                    {virtualRow.index}
                  </Box> */}
                  <MsgItem msg={item} />
                </Box>
              );
            })}
          </Box>
        </InfiniteLoader>
      )}
    </>
  );
};

export default GroupMessageList;
