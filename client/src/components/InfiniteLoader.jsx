import React, { useRef, useContext, useEffect, useState } from "react";
import DmContext from "../contexts/DmContext";
import ChatSkeleton from "./ChatSkeleton";

const InfiniteLoader = ({ next, loader, children }) => {
  const {
    chatData: { reachedTop, hasMoreUp },
  } = useContext(DmContext);

  useEffect(() => {
    if (!hasMoreUp) return;

    const timer = setTimeout(() => {
      if (reachedTop) {
        next();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [reachedTop]);

  return (
    <>
      {children}
      {hasMoreUp && <div className="mb-4">{loader}</div>}
    </>
  );
};

export default InfiniteLoader;
