import React from "react";
import ShopList from "./ShopList";
import { Box, Flex, Title } from "@mantine/core";
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
          <Title order={1} my={"xl"}>
            Shop
          </Title>
          <ShopList />
        </Box>
      </Flex>
    </>
  );
};

export default Shop;
