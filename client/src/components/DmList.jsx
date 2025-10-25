import React, {
  useState,
  useContext,
  memo,
  useEffect,
  useRef,
  useMemo,
} from "react";
import DmItem from "./DmItem.jsx";
import { PulseLoader } from "react-spinners";
import { useOutletContext, useParams } from "react-router-dom";
import MyLoader from "./InfiniteLoader.jsx";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  QueryClient,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import ChatSkeleton from "./ChatSkeleton.jsx";
import { dmDataQuery } from "../loaders/index.js";
import { useHasMoreUpStore } from "../stores/useHasMoreUpStore.js";
import { usePendingMsgStore } from "../stores/usePendingMsgStore.js";
import { Box } from "@mantine/core";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";

const DmList = ({ isInitialDataLoading }) => {
  const { userId: receiverId } = useParams();
  const { activeMsg } = useContext(DmPanelContext);
  const queryClient = useQueryClient();
  const { data: cachedQuery } = useQuery(dmDataQuery(receiverId));
  const addToHasMoreUp = useHasMoreUpStore((state) => state.addToHasMoreUp);
  const pendingMsgs = usePendingMsgStore((state) => state.pendingMsgs);
  const currentChat = cachedQuery?.dms ?? [];
  const { scrollElementRef, dmChatRef } = useOutletContext();
  const {
    scrollPosition,
    initialPageParam,
    prevScrollHeight,
    prevChatDataUpdatedAtRef,
  } = dmChatRef.current;
  const fetchMoreData = async ({ pageParam }) => {
    const res = await fetch(`/api/dm/moreData?nextId=${pageParam}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      console.log("ERROR");
      throw new Error(data.error);
    }

    return data;
  };
  const {
    data,
    error,
    fetchNextPage,
    isFetched,
    hasNextPage,
    isSuccess,
    isError,
    dataUpdatedAt,
  } = useInfiniteQuery({
    queryKey: ["moreMessages", receiverId],
    queryFn: fetchMoreData,
    initialPageParam: initialPageParam[receiverId],
    getNextPageParam: (lastPage) => {
      return lastPage.nextId ?? undefined;
    },
    enabled: false,
  });

  const itemsContainerRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: (currentChat?.length ?? 0) + (pendingMsgs[receiverId]?.length ?? 0),
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 80,
    overscan: 5,
    gap: 20,
  });
  const items = useMemo(
    () => [...(currentChat ?? []), ...(pendingMsgs[receiverId] ?? [])],
    [currentChat, pendingMsgs[receiverId]]
  );

  // if (isError) {
  //   console.log(error.message);
  // }

  useEffect(() => {
    const el = scrollElementRef.current;
    if (!el) return;

    const handleScroll = () => {
      scrollPosition[receiverId] = el.scrollTop;
    };

    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [scrollElementRef.current, receiverId]);

  useLayoutEffect(() => {
    //* If item length FaChampagneGlasses,adjust scrollPosition
    if (!items.length) return;

    const el = scrollElementRef.current;

    if (!el) return;
    if (isFetched) {
      const isDataNew = prevChatDataUpdatedAtRef[receiverId] != dataUpdatedAt;

      prevChatDataUpdatedAtRef[receiverId] = dataUpdatedAt;

      if (isDataNew) {
        const diff = el.scrollHeight - (prevScrollHeight[receiverId] ?? 0);

        el.scrollTop = el.scrollTop + diff;
      } else {
        //* After the fetch, new data hasnt been fetched
        el.scrollTop = scrollPosition[receiverId];
      }
    } else if (scrollPosition[receiverId] == undefined) {
      el.scrollTop = el.scrollHeight;
    }

    scrollElementRef.current.scrollTop = scrollElementRef.current.scrollHeight;

    prevScrollHeight[receiverId] = el.scrollHeight;
    scrollPosition[receiverId] = el.scrollTop;
  }, [items]);

  useEffect(() => {
    if (!isSuccess) return;

    const { dms } = data.pages[data.pages.length - 1];
    const isDataNew = prevChatDataUpdatedAtRef[receiverId] != dataUpdatedAt;

    if (!dms.length) return;
    if (!isDataNew) return;

    queryClient.setQueryData(["chatMessages", receiverId], (oldData) => ({
      ...oldData,
      dms: [...dms, ...oldData.dms],
    }));

    scrollElementRef.current.scrollTop = scrollElementRef.current.scrollHeight;

    addToHasMoreUp(receiverId, hasNextPage);
  }, [data]);

  return (
    <>
      {isInitialDataLoading ? (
        <ChatSkeleton />
      ) : (
        <MyLoader next={fetchNextPage} loader={<PulseLoader color={"white"} />}>
          <Box
            h={rowVirtualizer.getTotalSize()}
            style={{
              position: "relative",
            }}
            p={"xs"}
            ref={itemsContainerRef}
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
                  <DmItem msg={item} activeMsg={activeMsg} />
                </Box>
              );
            })}
          </Box>
        </MyLoader>
      )}
    </>
  );
};

export default DmList;
