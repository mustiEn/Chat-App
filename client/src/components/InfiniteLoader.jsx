import { Box } from "@mantine/core";

import { useOutletContext, useParams } from "react-router-dom";

const InfiniteLoader = ({ children }) => {
  const { scrollElementRef } = useOutletContext();

  return (
    <>
      <Box
        style={{
          height: "100%",
          overflowY: "auto",
        }}
        id={"scrollableRef"}
        ref={scrollElementRef}
        className="custom-scrollbar"
        px={"md"}
      >
        {children}
      </Box>
    </>
  );
};

export default InfiniteLoader;
