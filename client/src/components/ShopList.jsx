import React, { useState } from "react";
import ProductBackground from "./ProductBackground";
import ProductProfileIcons from "./ProductProfileIcons";
import ProductAnimatedView from "./ProductAnimatedView";
import { Box, Flex, Grid, Group, Stack } from "@mantine/core";

const ShopList = () => {
  // const arr = [
  //   <ProductBackground />,
  //   <ProductProfileIcons />,
  //   <ProductAnimatedView />,
  // ];
  return (
    <>
      <Flex wrap={"wrap"} justify={"space-between"} gap={"md"}>
        <ProductBackground />
        <ProductProfileIcons />
        <ProductAnimatedView />
      </Flex>
    </>
  );
};

export default ShopList;
