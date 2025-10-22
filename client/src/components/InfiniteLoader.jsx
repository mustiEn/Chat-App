import React, { useEffect } from "react";

import { useOutletContext, useParams } from "react-router-dom";
import DmHeadProfile from "./DmHeadProfile";
import { useInView } from "react-intersection-observer";
import { useQueryClient } from "@tanstack/react-query";
import { useHasMoreUpStore } from "../stores/useHasMoreUpStore.js";

const InfiniteLoader = ({ next, loader, children }) => {
  const { userId: receiverId } = useParams();
  const hasMoreUp = useHasMoreUpStore((state) => state.hasMoreUp);
  const queryClient = useQueryClient();
  const queryData = queryClient.getQueryData(["chatMessages", receiverId]);
  const currentChat = queryData?.dms ?? [];
  const { ref, inView } = useInView({
    threshold: 1,
  });
  const { scrollElementRef } = useOutletContext();

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
            <DmHeadProfile />
            <div className="empty-state">
              No messages yet. Start the conversation!
            </div>
          </>
        ) : !hasMoreUp[receiverId] ? (
          <DmHeadProfile />
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
