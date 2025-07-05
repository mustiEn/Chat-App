import React, { useCallback, useContext, useEffect, useState } from "react";
import DmContext from "../contexts/DmContext";

const InfiniteLoader = ({
  hasMoreUp,
  hasMoreDown,
  next,
  nextInPinnedMsgView,
  loader,
  children,
}) => {
  // const [reachedTop, setReachedTop] = useState(false);
  const {
    chatData: { isPinnedMsgViewOpen, reachedTop, div: myref },
    setChatData,
  } = useContext(DmContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (reachedTop) {
        // setReachedTop(false);
        if (isPinnedMsgViewOpen) {
          nextInPinnedMsgView();
        } else {
          next();
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [reachedTop]);
  return (
    <>
      {hasMoreDown && loader}
      {children}
      {hasMoreUp && loader}
    </>
  );
};

export default InfiniteLoader;
