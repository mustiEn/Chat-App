import React from "react";
import ProductAnimatedViewSkeleton from "./ProductAnimatedViewSkeleton";
import { Box, Card, Text } from "@mantine/core";
import styles from "../css/shop_list.module.css";

const animatedViews = [
  "atomic.gif",
  "circles.gif",
  "data-grid.gif",
  "fire.gif",
  "green-galaxy.gif",
  "matrix.gif",
  "network.gif",
  "organic-lines.gif",
  "particles.gif",
  "silky-blue.gif",
];
const ProductAnimatedView = () => {
  return (
    <>
      {animatedViews.map((view, i) => (
        // <Card
        //   className={`rounded-3 ${styles["card-div"]} ${styles["card-animated-view"]}`}
        //   key={i}
        // >
        //   <div
        //     className={`${styles["card-animated-view-inner"]} position-relative`}
        //   >
        //     <div className={` w-100 h-100 position-relative top-0`}>
        //       <ProductAnimatedViewSkeleton
        //         styles={styles}
        //         animatedViewName={view}
        //       />
        //     </div>
        //   </div>
        //   <Card.Body className={`text-white ${styles["card-body-div"]}`}>
        //     <Card.Title>Card Title</Card.Title>
        //     <Card.Text>£10.99</Card.Text>
        //   </Card.Body>
        // </Card>
        <Card
          className={[styles["card-div"], styles["card-animated-view"]].join(
            " "
          )}
          radius={"lg"}
          key={i}
        >
          <Card.Section>
            <Box className={`${styles["card-animated-view-inner"]}`}>
              <Box
                w={"100%"}
                h={"100%"}
                style={{
                  position: "relative",
                  top: 0,
                }}
              >
                <ProductAnimatedViewSkeleton
                  styles={styles}
                  animatedViewName={view}
                />
              </Box>
            </Box>
          </Card.Section>
          <Box color="white" className={` ${styles["card-body-div"]}`}>
            <Text>Card Title</Text>
            <Text>£10.99</Text>
          </Box>
        </Card>
      ))}
    </>
  );
};

export default ProductAnimatedView;
