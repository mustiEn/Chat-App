import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DmItem from "./DmItem.jsx";
import { memo } from "react";
import DmContext from "../contexts/DmContext.jsx";
import { useContext } from "react";
import panelStyles from "../css/dm_panel.module.css";
import { PulseLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import MyLoader from "./InfiniteLoader.jsx";
import toast from "react-hot-toast";

const DmList = memo(function DmList({ styles, messagesEndRef }) {
  const { userId: receiverId } = useParams();
  const {
    chatData,
    chatData: { messages, pendingMessages },
    setChatData,
    div,
  } = useContext(DmContext);
  const fetchMoreData = async () => {
    const offset = messages.length;
    try {
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

      const { dms } = data;

      if (!dms.length) {
        setChatData((prev) => ({
          ...prev,
          reachedTop: false,
          hasMoreUp: false,
        }));
        return;
      }
      setChatData((prev) => ({
        ...prev,
        reachedTop: false,
        messages: [...prev.messages, ...dms],
      }));
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
  };

  return (
    <>
      {messages.length === 0 ? (
        <div className="empty-state">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <MyLoader
          next={fetchMoreData}
          loader={<PulseLoader color={"white"} />}
          key={receiverId}
        >
          <ul className="d-flex flex-column-reverse gap-3 m-2">
            {[...pendingMessages, ...messages].map((msg) => (
              <DmItem
                key={msg.id ?? msg.clientOffset}
                msg={msg}
                styles={styles}
              />
            ))}
            <div ref={messagesEndRef} />
          </ul>
        </MyLoader>
        // <InfiniteScroll
        //   dataLength={
        //     [...messages, ...pendingMessages].length
        //   }
        //   next={fetchMoreData}
        //   inverse={true}
        //   hasMore={false}
        //   loader={<PulseLoader color={"white"} />}
        //   scrollableTarget={"scrollableDiv"}
        //   className="d-flex flex-column-reverse overflow-hidden"
        // >
        //   <ul className="d-flex flex-column-reverse gap-3 m-2">
        //     {[...messages, ...pendingMessages].map((msg) => (
        //       <DmItem
        //         key={msg.id}
        //         msg={msg}
        //         styles={styles}
        //       />
        //     ))}
        //     <div ref={messagesEndRef} />
        //   </ul>
        // </InfiniteScroll>
      )}
    </>
  );
});

export default DmList;
