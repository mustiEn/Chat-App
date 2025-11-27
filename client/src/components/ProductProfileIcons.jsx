import React from "react";
import Skeleton from "react-loading-skeleton";
import { Box, Card, Image, Text } from "@mantine/core";
import styles from "../css/shop_list.module.css";

const icons = [
  "alien.gif",
  "angel.gif",
  "smiling-face.gif",
  "uranus.gif",
  "valentines-day.gif",
  "shooting-star.gif",
  "rocket-launch.gif",
  "mars.gif",
  "galaxy.gif",
  "meteor-rain.gif",
  "core-value.gif",
  "core-values.gif",
  "star.gif",
];
const ProductProfileIcons = () => {
  return (
    <>
      {/* <Card
            className={`rounded-3 ${styles["card-product-profile-icon"]} ${styles["card-div"]}`}
            key={i}
          >
            <div
              className={`${styles["card-profile-icon-inner"]} position-relative`}
            >
              <Skeleton
                circle
                w={150}
                h={150}
                baseColor="#36363a"
                enableAnimation={false}
                className="position-absolute translate-middle top-50 start-50"
              />
              <img
                src={"/images/mona.jpg"}
                className={`${styles.profile} rounded-circle position-absolute translate-middle top-50 start-50 z-1`}
                w={150}
                h={150}
                alt=""
              />
              <img
                src={`/images/${icon}`}
                w={50}
                h={50}
                style={{ transform: "translate(-65px, 40px)" }}
                className={`rounded-circle position-absolute end-0 z-1`}
                alt=""
              />
            </div>
            <Card.Body className={`${styles["card-body-div"]} text-white`}>
              <Card.Title>Card Title</Card.Title>
              <Card.Text>£10.99</Card.Text>
            </Card.Body>
          </Card> */}
      {icons.map((icon, i) => (
        <Card
          className={[
            styles["card-product-profile-icon"],
            styles["card-div"],
          ].join(" ")}
          radius={"lg"}
          key={i}
        >
          <Card.Section>
            <Box
              className={`${styles["card-profile-icon-inner"]}`}
              style={{
                position: "relative",
              }}
            >
              <Skeleton
                circle
                width={150}
                height={150}
                baseColor="#36363a"
                enableAnimation={false}
                className=" translate-middle"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                }}
              />
              <Image
                src={"/images/mona.jpg"}
                className={`${styles.profile} translate-middle`}
                w={150}
                h={150}
                radius={"100%"}
                alt=""
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  zIndex: 1,
                }}
              />
              <Image
                src={`/images/${icon}`}
                w={50}
                h={50}
                radius={"xl"}
                alt=""
                style={{
                  position: "absolute",
                  right: 0,
                  zIndex: 1,
                  transform: "translate(-65px, 40px)",
                }}
              />
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

export default ProductProfileIcons;
