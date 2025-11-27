import { Box, Center } from "@mantine/core";
import React from "react";

const Header = ({ content }) => {
  return (
    <>
      <Box
        w={"100%"}
        h={"var(--header-height)"}
        color="white"
        fz={5}
        style={{ backgroundColor: "#121214" }}
      >
        <Center>{content}</Center>
      </Box>
    </>
  );
};

export default Header;
