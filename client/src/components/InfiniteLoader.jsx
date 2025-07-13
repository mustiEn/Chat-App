import React, { useRef, useContext, useEffect, useState } from "react";
import DmContext from "../contexts/DmContext";
import { useParams } from "react-router-dom";

const InfiniteLoader = ({ next, nextInPinnedMsgView, loader, children }) => {
  const {
    chatData: {
      isPinnedMsgViewOpen,
      reachedTop,
      reachedBottom,
      hasMoreUp,
      hasMoreDown,
    },
  } = useContext(DmContext);

  useEffect(() => {
    console.log("infinite loader useffect");
    if (!hasMoreDown && !hasMoreUp) return;
    console.log("infinite loader useffect after return");

    const timer = setTimeout(() => {
      if (reachedTop) {
        console.log("reached top ran");
        if (isPinnedMsgViewOpen) {
          console.log("reached top, ran nextInPinnedMsgView");
          nextInPinnedMsgView();
        } else {
          // console.log("reached top, ran next");
          next();
        }
      } else if (reachedBottom) {
        console.log("reached bottom ran nextInPinnedMsgView");
        nextInPinnedMsgView();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [reachedTop, reachedBottom]);

  // useEffect(() => {
  //   console.log("infinite loader useffect div", div);
  // }, [div, div?.currentcurrent]);

  return (
    <>
      {hasMoreDown && loader}
      {children}
      {hasMoreUp && loader}
    </>
  );
};

export default InfiniteLoader;
