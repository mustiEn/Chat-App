import React, {
  useRef,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import ChatSkeleton from "./ChatSkeleton";
import { useOutletContext, useParams } from "react-router-dom";
import DmHeadProfile from "./DmHeadProfile";
import { useInView } from "react-intersection-observer";

const InfiniteLoader = ({ next, loader, children, receiver }) => {
  const { userId: receiverId } = useParams();
  const { ref, inView, entry } = useInView({
    threshold: 1,
  });
  const {
    dmChat: { hasMoreUp, messages },
    scrollElementRef,
  } = useOutletContext();

  useEffect(() => {
    if (hasMoreUp[receiverId] && inView) {
      next();
    }
  }, [inView]);

  return (
    <>
      <div
        style={{
          height: 700,
          overflowY: "auto",
        }}
        id={"scrollableref"}
        ref={scrollElementRef}
        className="custom-scrollbar px-2"
      >
        {!messages[receiverId].length ? (
          <>
            <DmHeadProfile receiver={receiver} />
            <div className="empty-state">
              No messages yet. Start the conversation!
            </div>
          </>
        ) : !hasMoreUp[receiverId] ? (
          <DmHeadProfile receiver={receiver} />
        ) : (
          ""
        )}
        {hasMoreUp[receiverId] && messages[receiverId] && (
          <div className="mb-4" ref={ref}>
            {loader}
          </div>
        )}
        {children}
      </div>
    </>
  );
};

export default InfiniteLoader;
