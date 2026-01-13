import { Box, Center, Text } from "@mantine/core";
import React from "react";

const Header = ({ content }) => {
  return (
    <>
      <Box
        w={"100%"}
        h={"var(--header-height)"}
        color="white"
        style={{ backgroundColor: "#121214" }}
      >
        <Center>
          <Text fz={"lg"}>{content}</Text>
        </Center>
      </Box>
    </>
  );
};

export default Header;
