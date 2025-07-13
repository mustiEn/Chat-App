import React, { useEffect, useMemo, useRef, useState } from "react";
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
    chatData: {
      messages,
      pinnedMessagesView,
      jumpToMsgId,
      pendingMessages,
      direction,
      isPinnedMsgViewOpen,
      reachedTop,
      hasMoreUp,
      hasMoreDown,
    },
    setChatData,
    div,
  } = useContext(DmContext);
  const isJumpClicked = useRef(null);

  const fetchMoreData = async () => {
    const offset = pinnedMessagesView.length
      ? pinnedMessagesView.length
      : messages.length;
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
    } catch (err) {}
  };
  const fetchMoreDataInPinnedMsgView = async (pinnedMsgId = undefined) => {
    try {
      const reff = div?.current;
      const scrollDirection = isJumpClicked.current != null ? "" : direction;
      const returnEdgeMsgId = (val) => {
        const arr = val ? pinnedMessagesView : messages;
        let edgeMsgId;

        if (scrollDirection === "up") {
          edgeMsgId = val ? arr[arr.length - 1].id : arr[arr.length - 1].id;
        } else if (scrollDirection == "down") {
          edgeMsgId = val ? arr[0].id : arr[0].id;
        } else {
          edgeMsgId = val
            ? messages[messages.length - 1].id
            : messages[messages.length - 1].id;
        }
        return edgeMsgId;
      };
      const adjustScrollBar = (prevClientH, prevScrollH) => {
        const timer = setInterval(() => {
          if (prevScrollH != reff.scrollHeight) {
            clearInterval(timer);
            reff.scrollTop = prevClientH - prevScrollH;
          }
        }, 300);
        setTimeout(() => {
          clearInterval(timer);
        }, 5000);
      };
      const edgeMsgId = returnEdgeMsgId(isPinnedMsgViewOpen);
      let reqBody = {
        direction: scrollDirection,
        receiverId,
        msgsLength: messages.length,
        edgeMsgId,
      };

      reqBody = pinnedMsgId ? { ...reqBody, pinnedMsgId } : reqBody;

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

      console.log("scr", scrollDirection);

      if (jumpToMsgId && isJumpClicked.current) {
        setChatData((prev) => ({
          ...prev,
          //& not important jumpToMsgId: null,
          hasMoreDown: true,
          hasMoreUp: true,
          isPinnedMsgViewOpen: true,
          pinnedMessagesView: dms,
        }));
        isJumpClicked.current = null;
      } else if (scrollDirection == "down") {
        const clientHeight = reff.clientHeight;
        const scrollHeight = reff.scrollHeight;
        const lastMsgExists = dms.findIndex(
          (m) => m.id == messages[messages.length - 1].id
        );

        if (lastMsgExists == -1) {
          console.log("not lastMsgExists");
          setChatData((prev) => ({
            ...prev,
            isPinnedMsgViewOpen: true,
            hasMoreDown: true,
            reachedBottom: false,

            pinnedMessagesView: [...dms, ...prev.pinnedMessagesView],
          }));
          adjustScrollBar(clientHeight, scrollHeight);
        } else {
          console.log("lastMsgExists");
          setChatData((prev) => {
            const newMessages = dms.slice(lastMsgExists + 1);

            return {
              ...prev,
              pinnedMessagesView: [],
              isPinnedMsgViewOpen: false,
              reachedBottom: false,
              hasMoreDown: false,
              messages: [
                ...prev.messages,
                ...newMessages,
                ...prev.pinnedMessagesView,
              ],
            };
          });
          // adjustScrollBar(clientHeight, scrollHeight);
        }
      } else if (scrollDirection == "up") {
        console.log(isPinnedMsgViewOpen);
        console.log(!hasMoreDown && !dms.length);
        setChatData((prev) => {
          const isAllFetched = !prev.hasMoreDown && !dms.length;

          return {
            ...prev,
            // hasMoreDown:true,
            hasMoreUp: !dms.length ? false : true,
            reachedTop: false,
            // isPinnedMsgViewOpen: true,
            pinnedMessagesView: [...prev.pinnedMessagesView, ...dms],
          };
        });
      }

      const timer = setInterval(() => {
        const msg = document.getElementById(`message-${pinnedMsgId}`);

        if (msg) {
          msg.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setTimeout(() => {
            msg.classList.add(panelStyles.active);
            setTimeout(() => {
              msg.classList.remove(panelStyles.active);
            }, 1000);
          }, 300);
          clearInterval(timer);
          setChatData((prev) => ({
            ...prev,
            isPending: false,
          }));
        }
      }, 300);
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!jumpToMsgId) return;
    isJumpClicked.current = jumpToMsgId;
    console.log("jumpToMsgId", jumpToMsgId);

    fetchMoreDataInPinnedMsgView(jumpToMsgId);
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
          loader={<PulseLoader color={"white"} />}
          key={receiverId}
        >
          <ul className="d-flex flex-column-reverse gap-3 m-2">
            {isPinnedMsgViewOpen
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
