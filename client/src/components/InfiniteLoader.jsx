import React, { useEffect } from "react";

import { useOutletContext, useParams } from "react-router-dom";

const InfiniteLoader = ({ children }) => {
  const { scrollElementRef } = useOutletContext();

  // console.log("dm loader");

  return (
    <>
      <div
        style={{
          height: "100%",
          overflowY: "auto",
        }}
        id={"scrollableRef"}
        ref={scrollElementRef}
        className="custom-scrollbar px-2"
      >
        {children}
      </div>
    </>
  );
};

export default InfiniteLoader;
