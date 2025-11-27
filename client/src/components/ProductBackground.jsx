import React from "react";
import ProductBackgroundSkeleton from "./ProductBackgroundSkeleton";
import { Box, Card, Text } from "@mantine/core";
import styles from "../css/shop_list.module.css";

const ProductBackground = () => {
  const bgs = [
    "kaneki.gif",
    "kaneki-2.gif",
    "michael-kaiser.gif",
    "blue-lock.gif",
  ];
  return (
    <>
      {bgs.map((bg, i) => (
        // <Card
        //   className={`rounded-3 ${styles["card-product-bg"]} ${styles["card-div"]}`}
        //   key={i}
        // >
        //   <div className={`${styles["card-bg-inner"]} position-relative`}>
        //     <div className={`w-100 h-100 position-relative top-0`}>
        //       <ProductBackgroundSkeleton />
        //     </div>

        //     <div
        //       className={`${styles["product-bg"]} position-absolute z-0 top-0 w-100 h-100`}
        //       style={{
        //         backgroundImage: `url(/images/${bg})`,
        //       }}
        //     ></div>
        //   </div>
        //   <Card.Body
        //     className={`${styles["card-body-div"]} text-white position-relative z-1`}
        //   >
        //     <Card.Title>Card Title</Card.Title>
        //     <Card.Text>£10.99</Card.Text>
        //   </Card.Body>
        // </Card>

        <Card
          className={[styles["card-div"], styles["card-product-bg"]].join(" ")}
          radius={"lg"}
          key={i}
        >
          <Card.Section>
            <Box
              className={`${styles["card-bg-inner"]}`}
              style={{
                position: "relative",
              }}
            >
              <Box
                w={"100%"}
                h={"100%"}
                style={{
                  position: "relative",
                  top: 0,
                }}
              >
                <ProductBackgroundSkeleton />
              </Box>

              <Box
                w={"100%"}
                h={"100%"}
                className={`${styles["product-bg"]}`}
                style={{
                  backgroundImage: `url(/images/${bg})`,
                  position: "absolute",
                  zIndex: 0,
                  top: 0,
                }}
              ></Box>
            </Box>
          </Card.Section>
          <Box
            color="white"
            className={` ${styles["card-body-div"]}`}
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Text>Card Title</Text>
            <Text>£10.99</Text>
          </Box>
        </Card>
      ))}
    </>
  );
};

export default ProductBackground;
