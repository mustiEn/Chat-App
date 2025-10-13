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
import toast from "react-hot-toast";
import DmModalNotifier from "./DmModalNotifier.jsx";
import { socket } from "../socket.js";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  QueryClient,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import ChatSkeleton from "./ChatSkeleton.jsx";

const DmList = ({ receiver, isInitialDataLoading }) => {
  const { userId: receiverId } = useParams();
  const queryClient = useQueryClient();
  const queryData = queryClient.getQueryData(["initialChatData", receiverId]);
  let currentChat = queryData?.dms || [];
  const typeRef = useRef(null);
  const {
    dmChat: { pendingMessages },
    setDmChat,
    scrollElementRef,
    dmChatRef,
  } = useOutletContext();
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
  const [modal, setModal] = useState({
    activeMsg: null,
    show: false,
  });
  const handleDmModalNotifier = (msg, type) => {
    setModal({ activeMsg: msg, show: true });
    typeRef.current = type;
  };
  const pinMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't pin the message");
      return;
    }
    socket.emit(
      "send pinned msgs",
      {
        id: modal.activeMsg.id,
        isPinned: true,
        receiverId,
      },
      (err, res) => {
        if (err) {
          console.log("Error: ", err);
        }

        queryClient.setQueryData(
          ["initialChatData", String(receiverId)],
          (olderData) => [modal.activeMsg, ...olderData]
        );
        console.log("Pinned message successfully", res);
      }
    );
    setModal({
      activeMsg: null,
      show: false,
    });
  };
  const deleteMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't delete the message");
      return;
    }
    socket.emit(
      "deleted msgs",
      {
        id: modal.activeMsg.id,
      },
      (err, res) => {
        if (err) {
          console.log("err", err);
        } else {
          console.log("res", res);
        }
      }
    );
  };
  const itemsContainerRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count:
      (currentChat?.length ?? 0) + (pendingMessages[receiverId]?.length ?? 0),
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 80,
    overscan: 5,
    gap: 20,
  });
  const items = useMemo(
    () => [...(currentChat ?? []), ...(pendingMessages[receiverId] ?? [])],
    [currentChat, pendingMessages[receiverId]]
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

    queryClient.setQueryData(["initialChatData", receiverId], (oldData) => ({
      ...oldData,
      dms: [...dms, ...oldData.dms],
    }));

    scrollElementRef.current.scrollTop = scrollElementRef.current.scrollHeight;

    setDmChat((prev) => ({
      ...prev,
      hasMoreUp: {
        ...prev.hasMoreUp,
        [receiverId]: hasNextPage,
      },
    }));
  }, [data]);

  return (
    <>
      {isInitialDataLoading || !currentChat ? (
        <ChatSkeleton />
      ) : (
        <MyLoader
          next={fetchNextPage}
          loader={<PulseLoader color={"white"} />}
          receiver={receiver}
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
            className="p-2"
            ref={itemsContainerRef}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    width: "100%",
                    top: 0,
                    left: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                >
                  <DmItem
                    msg={item}
                    handleDmModalNotifier={handleDmModalNotifier}
                  />
                </div>
              );
            })}
          </div>
        </MyLoader>
      )}

      <DmModalNotifier
        type={typeRef.current}
        activeMsg={modal.activeMsg}
        func={typeRef.current == "Pin" ? pinMessage : deleteMessage}
        show={modal.show}
        setModal={setModal}
      />
    </>
  );
};

export default DmList;
