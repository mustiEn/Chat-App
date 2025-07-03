import React, { useMemo } from "react";
import { useRef } from "react";
import DmItem from "./DmItem.jsx";
import { memo } from "react";
import DmContext from "../contexts/DmContext.jsx";
import { useContext } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from "react";
import { useEffect } from "react";
import ChatSkeleton from "./ChatSkeleton.jsx";
import { PulseLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";

const DmList = memo(function DmList({
  styles,
  messagesEndRef,
  hasMore,
  setHasMore,
}) {
  const msgListRef = useRef(null);
  const [start, setStart] = useState(9750);
  const { userId: receiverId } = useParams();
  const { chatData, setChatData } = useContext(DmContext);
  const fetchMoreData = async () => {
    console.log("fetching more data");
    try {
      const offset = chatData.messages.length;
      const res = await fetch(`/api/dm/${offset}`, {
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
        throw new Error(data.msg);
      }

      if (data.dms.length === 0) {
        setHasMore(false);
        return;
      }
      setChatData((prev) => ({
        ...prev,
        messages: [...prev.messages, ...data.dms],
      }));
    } catch (err) {
      console.log(err);
    }

    // if (deneme.length != chatDataMessages.length) {
    //   setDeneme((prev) => [
    //     ...chatDataMessages.slice(start - 250, start),
    //     ...prev,
    //   ]);
    //   setStart((prev) => prev - 250);
    //   console.log(start);
    //   return;
    // }
    // setHasMore(false);
  };
  useEffect(() => {
    const div = document.getElementById("scrollableDiv");
    const handleScroll = () => {
      console.log("ScrollTop:", div.scrollTop);
      console.log("ScrollHeight:", div.scrollHeight);
      console.log("ClientHeight:", div.clientHeight);
    };

    div.addEventListener("scroll", handleScroll);

    // Cleanup
    return () => {
      div.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {chatData.messages.length === 0 ? (
        <div className="empty-state">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <InfiniteScroll
          dataLength={
            [...chatData.messages, ...chatData.pendingMessages].length
          }
          next={fetchMoreData}
          inverse={true}
          hasMore={hasMore}
          loader={<PulseLoader color={"white"} />}
          scrollableTarget={"scrollableDiv"}
          className="d-flex flex-column-reverse overflow-hidden"
        >
          <ul className="d-flex flex-column-reverse gap-3 m-2">
            {[...chatData.messages, ...chatData.pendingMessages].map((msg) => (
              <DmItem
                key={msg.id}
                msg={msg}
                styles={styles}
                msgListRef={msgListRef}
              />
            ))}
            <div ref={messagesEndRef} />
          </ul>
        </InfiniteScroll>
      )}
    </>
  );
});

export default DmList;
