import React, { useEffect, useMemo } from "react";
import DmItem from "./DmItem.jsx";
import { memo } from "react";
import DmContext from "../contexts/DmContext.jsx";
import { useContext } from "react";
import panelStyles from "../css/dm_panel.module.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { PulseLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import MyLoader from "./InfiniteLoader.jsx";
import toast from "react-hot-toast";

const DmList = memo(function DmList({ styles, messagesEndRef }) {
  const { userId: receiverId } = useParams();
  const {
    chatData: {
      messages,
      pinnedMessagesView,
      jumpToMsgId,
      pendingMessages,
      direction,
      hasMoreUp,
      hasMoreDown,
    },
    setChatData,
  } = useContext(DmContext);
  const fetchMoreData = async () => {
    console.log("fetching more data");
    try {
      const offset = messages.length;
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
          hasMoreUp: false,
        }));
        return;
      }
      setChatData((prev) => ({
        ...prev,
        messages: [...prev.messages, ...dms],
      }));
    } catch (err) {
      console.log(err);
    }
  };
  const fetchMoreDataInPinnedMsgView = async (
    ignore,
    pinnedMsgId = undefined
  ) => {
    try {
      const scrollDirection = direction;
      let edgeMsgId;

      if (scrollDirection === "up") {
        edgeMsgId = messages[messages.length - 1].id;
      } else if (scrollDirection == "down") {
        edgeMsgId = messages[0].id;
      } else {
        edgeMsgId = messages[messages.length - 1].id;
      }

      let reqBody = {
        direction: scrollDirection,
        receiverId,
        msgsLength: messages.length,
        edgeMsgId,
      };

      reqBody = pinnedMsgId ? { ...reqBody, pinnedMsgId } : reqBody;
      // reqBody = edgeMsgId ? { ...reqBody, edgeMsgId } : reqBody;

      const res = await fetch(`/api/dm/pinned-message-view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
      }

      const { dms } = data;

      if (ignore) return;

      if (scrollDirection != "up") {
        const lastMsgExists = dms.findIndex(
          (m) => m.id == messages[messages.length - 1].id
        );
        if (lastMsgExists == -1) {
          setChatData((prev) => ({
            ...prev,
            pinnedMessagesView: [...dms, ...prev.pinnedMessagesView],
          }));
        } else {
          hasMoreDown(false);
          setChatData((prev) => {
            const newMessages = dms.slice(lastMsgExists);

            return {
              ...prev,
              pinnedMessagesView: [],
              messages: [...newMessages, ...prev.messages],
            };
          });
        }
      } else if (scrollDirection == "up") {
        if (dms == []) hasMoreUp(false);
        setChatData((prev) => ({
          ...prev,
          pinnedMessagesView: [...prev.pinnedMessagesView, ...dms],
        }));
      }

      const timer = setInterval(() => {
        const div = document.getElementById(`message-${pinnedMsgId}`);

        if (div) {
          div.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setTimeout(() => {
            div.classList.add(panelStyles.active);
            setTimeout(() => {
              div.classList.remove(panelStyles.active);
            }, 1000);
          }, 300);
          clearInterval(timer);
        }
      }, 300);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    let ignore = false;

    if (jumpToMsgId) fetchMoreDataInPinnedMsgView(ignore, jumpToMsgId);

    return () => (ignore = true);
  }, [jumpToMsgId]);

  return (
    <>
      {messages.length === 0 ? (
        <div className="empty-state">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <MyLoader
          next={fetchMoreData}
          nextInPinnedMsgView={fetchMoreDataInPinnedMsgView}
          hasMoreUp={hasMoreUp}
          hasMoreDown={hasMoreDown}
          loader={<PulseLoader color={"white"} />}
        >
          <ul className="d-flex flex-column-reverse gap-3 m-2">
            {pinnedMessagesView.length > 0
              ? pinnedMessagesView.map((msg) => (
                  <DmItem
                    key={msg.id ?? msg.clientOffset}
                    msg={msg}
                    styles={styles}
                  />
                ))
              : [...pendingMessages, ...messages].map((msg) => (
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
