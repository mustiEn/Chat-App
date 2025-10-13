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
import { useQueryClient } from "@tanstack/react-query";

const InfiniteLoader = ({ next, loader, children, receiver }) => {
  const typeRef = useRef(null);
  const { userId: receiverId } = useParams();
  const queryClient = useQueryClient();
  const queryData = queryClient.getQueryData(["initialChatData", receiverId]);
  const currentChat = queryData?.dms || [];
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
        {!currentChat.length ? (
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
        {hasMoreUp[receiverId] && currentChat && (
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
