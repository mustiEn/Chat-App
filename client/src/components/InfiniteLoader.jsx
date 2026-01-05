import { Box } from "@mantine/core";

import { useOutletContext, useParams } from "react-router-dom";

const InfiniteLoader = ({ children }) => {
  const { scrollElementRef } = useOutletContext();

  return (
    <>
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          padding: "0px 8px 0px 8px",
        }}
        id={"scrollableRef"}
        ref={scrollElementRef}
        className="custom-scrollbar"
      >
        {children}
      </div>
    </>
  );
};

export default InfiniteLoader;
