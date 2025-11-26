import React from "react";
import ShopList from "./ShopList";
import { Box, Flex } from "@mantine/core";
import ShopTop from "./ShopTop";

const Shop = () => {
  return (
    <>
      <Flex direction={"column"} pb={"xs"} h={"100%"}>
        <ShopTop />
        <Box
          className="custom-scrollbar"
          px={"sm"}
          style={{
            overflow: "auto",
          }}
        >
          <h1 className="my-5">Shop</h1>
          <ShopList />
        </Box>
      </Flex>
    </>
  );
};

export default Shop;
