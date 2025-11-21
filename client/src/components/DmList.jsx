import React, { useState, useContext, useEffect, useMemo } from "react";
import DmItem from "./DmItem.jsx";
import { PulseLoader } from "react-spinners";
import { useOutletContext, useParams } from "react-router-dom";
import MyLoader from "./InfiniteLoader.jsx";
import { useVirtualizer } from "@tanstack/react-virtual";

import { useLayoutEffect } from "react";
import ChatSkeleton from "./ChatSkeleton.jsx";
import { useHasMoreUpStore } from "../stores/useHasMoreUpStore.js";
import { usePendingMsgStore } from "../stores/usePendingMsgStore.js";
import { Box } from "@mantine/core";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import { useChatMessages } from "../custom-hooks/useChatMessages.js";
import DmHeadProfile from "./DmHeadProfile.jsx";
import { useInView } from "react-intersection-observer";
import { socket } from "../socket.js";

const DmList = () => {
  const { chatId } = useParams();
  const { scrollElementRef, dmChatRef } = useOutletContext();
  const { receiverId } = useContext(DmPanelContext);

  const pendingMsgs = usePendingMsgStore((s) => s.pendingMsgs);
  const addToHasMoreUp = useHasMoreUpStore((s) => s.addToHasMoreUp);
  const hasMoreUp = useHasMoreUpStore((s) => s.hasMoreUp);

  const {
    scrollPosition,
    prevTopId,
    dmPanel: { chatMessagesTopId },
    msgAddedOrDeleted,
  } = dmChatRef.current;
  const {
    data: chatMessages,
    fetchNextPage,
    isFetched,
    hasNextPage,
    isLoading,
    isSuccess,
    dataUpdatedAt,
  } = useChatMessages(chatId);

  const reversed = chatMessages && chatMessages.pages.toReversed();
  const messages = reversed ? reversed.flatMap(({ messages }) => messages) : [];
  const items = useMemo(
    () => [...messages, ...(pendingMsgs[chatId] ?? [])],
    [messages, pendingMsgs[chatId]]
  );
  const rowVirtualizer = useVirtualizer({
    count: (messages.length ?? 0) + (pendingMsgs[chatId]?.length ?? 0),
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 80,
    overscan: 5,
    gap: 20,
  });
  const { ref, inView } = useInView({
    threshold: 0.6,
  });

  useEffect(() => {
    const el = scrollElementRef.current;

    if (!el) return;

    const handleScroll = () => {
      scrollPosition[chatId] = el.scrollTop;
    };

    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      // console.log("scerollposition", scrollPosition);
    };
  }, [scrollElementRef.current, chatId]);

  useLayoutEffect(() => {
    const el = scrollElementRef.current;

    if (!items.length || !el) return;

    const latestTopId = items[0].id;
    const newMsgsLoaded =
      chatMessagesTopId[chatId] && chatMessagesTopId[chatId] !== latestTopId;
    const isNearBottom = rowVirtualizer.range.endIndex >= items.length - 4;

    if (scrollPosition[chatId] === undefined) {
      el.scrollTop = el.scrollHeight;
      scrollPosition[chatId] = el.scrollTop;
      addToHasMoreUp(chatId, hasNextPage);
    } else if (newMsgsLoaded) {
      const index = items.findIndex(({ id }) => id == prevTopId[chatId]);

      addToHasMoreUp(chatId, hasNextPage);
      rowVirtualizer.scrollToIndex(index, {
        align: "center",
        behavior: "smooth",
      });
    } else if (isNearBottom && msgAddedOrDeleted[chatId]) {
      el.scrollTo({ top: el.scrollHeight + 20, behavior: "smooth" });
      msgAddedOrDeleted[chatId] = false;
    }
    // else {
    //   console.log("not new");

    //   el.scrollTop = scrollPosition[chatId];
    // }

    socket.auth.serverOffset[receiverId] = messages.at(-1)?.id ?? 0;
    chatMessagesTopId[chatId] = latestTopId;
  }, [items]);

  useLayoutEffect(() => {
    const el = scrollElementRef.current;

    if (!el) return;
    el.scrollTop = scrollPosition[chatId];
  }, []);

  useEffect(() => {
    if (hasMoreUp[chatId] && inView) {
      const el = scrollElementRef.current;

      prevTopId[chatId] = messages.at(0)?.id;
      scrollPosition[chatId] = el.scrollTop;

      fetchNextPage();
    }
  }, [inView]);

  return (
    <>
      {isLoading ? (
        <ChatSkeleton />
      ) : (
        <MyLoader next={fetchNextPage} loader={<PulseLoader color={"white"} />}>
          {!messages.length ? (
            <>
              <DmHeadProfile />
              <div className="empty-state">
                No messages yet. Start the conversation!
              </div>
            </>
          ) : !hasMoreUp[chatId] ? (
            <DmHeadProfile />
          ) : (
            ""
          )}
          {/* {hasMoreUp[chatId] && messages.length && (
            <div className="mb-4" ref={ref}>
              <PulseLoader color={"white"} />
            </div>
          )} */}
          {/* <Box
            h={rowVirtualizer.getTotalSize()}
            style={{
              position: "relative",
              minHeight: 355,
            }}
            p={"xs"}
          > */}
          {
            // rowVirtualizer.getVirtualItems().map((virtualRow) => {
            //   const item = items[virtualRow.index];
            //   return (
            //     <Box
            //       key={virtualRow.key}
            //       w={"100%"}
            //       top={0}
            //       left={0}
            //       style={{
            //         position: "absolute",
            //         transform: `translateY(${virtualRow.start}px)`,
            //       }}
            //       data-index={virtualRow.index}
            //       ref={rowVirtualizer.measureElement}
            //     >
            //       {/* <Box w={"100%"} p={"xs"}>
            //         {virtualRow.index}
            //       </Box> */}
            //       <DmItem msg={item} />
            //     </Box>
            //   );
            // })
          }
          {/* </Box> */}
        </MyLoader>
      )}
    </>
  );
};

export default DmList;
