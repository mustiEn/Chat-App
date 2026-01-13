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
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import { useDirectMessages } from "../custom-hooks/useDirectMessages.js";
import DmHeadProfile from "./DmHeadProfile.jsx";
import { useInView } from "react-intersection-observer";
import { socket } from "../socket.js";

const DmList = ({}) => {
  const { chatId } = useParams();
  const { scrollElementRef, dmChatRef } = useOutletContext();

  const pendingMsgs = usePendingMsgStore((s) => s.pendingMsgs.dm);
  const addToHasMoreUp = useHasMoreUpStore((s) => s.addToDmHasMoreUp);
  const hasMoreUp = useHasMoreUpStore((s) => s.hasMoreUp.dm);

  const {
    scrollPosition,
    prevTopId,
    dmPanel: { dmTopId },
    msgAddedOrDeleted,
  } = dmChatRef.current;
  const {
    data: directMessages,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useDirectMessages(chatId);

  const reversed = directMessages && directMessages.pages.toReversed();
  const messages = reversed?.flatMap(({ messages }) => messages) ?? [];
  const pending = pendingMsgs[chatId];
  const items = pending?.length ? [...messages, ...pending] : messages;

  const rowVirtualizer = useVirtualizer({
    count: items.length ?? 0,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 70,
    gap: 5,
    overscan: 5,
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
    const newMsgsLoaded = dmTopId[chatId] && dmTopId[chatId] !== latestTopId;
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
        // behavior: "smooth",
      });
    } else if (isNearBottom && msgAddedOrDeleted[chatId]) {
      el.scrollTo({ top: el.scrollHeight + 20, behavior: "smooth" });
      msgAddedOrDeleted[chatId] = false;
    }
    // else {
    //   console.log("not new");

    //   el.scrollTop = scrollPosition[chatId];
    // }

    socket.auth.serverOffset.dms[chatId] = messages.at(-1)?.id ?? 0;
    dmTopId[chatId] = latestTopId;
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
        <InfiniteLoader
          next={fetchNextPage}
          loader={<PulseLoader color={"white"} />}
        >
          {!messages.length ? (
            <>
              <DmHeadProfile />
              <div className="empty-state">
                No messages yet. Start the conversation!
              </div>
            </>
          ) : (
            !hasMoreUp[chatId] && <DmHeadProfile />
          )}
          {hasMoreUp[chatId] && messages.length && (
            <div
              ref={ref}
              style={{
                marginBottom: "var(--mantine-spacing-xl)",
              }}
            >
              <PulseLoader color={"white"} />
            </div>
          )}
          <div
            style={{
              position: "relative",
              minHeight: 355,
              padding: 5,
              height: rowVirtualizer.getTotalSize(),
            }}
            // p={"xs"}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`,
                    width: "100%",
                    top: 0,
                    left: 0,
                  }}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                >
                  <MsgItem msg={item} />
                </div>
              );
            })}
          </div>
        </InfiniteLoader>
      )}
    </>
  );
};

export default DmList;
