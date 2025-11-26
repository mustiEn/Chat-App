import React from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Image } from "@mantine/core";
import UserStatus from "./UserStatus";
import styles from "../css/friend_profile.module.css";

const FriendProfile = ({ showOffset, friend }) => {
  return (
    <>
      <Flex
        className={`${styles["offCanvas"]} flex-shrink-0 text-white ${
          showOffset ? styles["show"] : ""
        }`}
        direction={"column"}
        // style={{
        //   height: "50%",
        // }}
      >
        <Box
          w={"100%"}
          bg={"dark"}
          className={`${styles["friend-profile-bg"]}`}
        ></Box>
        <Box
          h={"100%"}
          px={"sm"}
          className="position-relative z-1"
          // style={{
          //   backgroundColor: "transparent",
          // }}
          style={{
            backgroundColor: "rgb(27 26 26)",
          }}
        >
          <Box
            w={80}
            h={80}
            style={{
              transform: "translateY(-55%)",
            }}
            className="position-relative z-1"
          >
            <Box
              style={{
                position: "relative",
              }}
              w={80}
              h={80}
            >
              <Image src={"https://placehold.co/80"} radius={"100%"} />
              {friend?.status && (
                <UserStatus status={friend.status} w={22} h={22} />
              )}
            </Box>
          </Box>
          <Box fw={"bold"} fz={20}>
            Dev2Github
          </Box>
          <p>dev2github_43534</p>
          <Box bg={"dark"} p={"sm"} bdrs={"sm"}>
            <Flex direction={"column"}>
              <p className="fw-bold" style={{ fontSize: 12 }}>
                Member Since
              </p>
              <Box>24 May 2025</Box>
            </Flex>
          </Box>
          {/* <DropdownButton
            id="dropdown-basic-button"
            title="Dropdown button"
            variant="dark"
            className="mt-2"
          >
            <Dropdown.Item as={Link}>Action</Dropdown.Item>
            <Dropdown.Item as={Link}>Another action</Dropdown.Item>
            <Dropdown.Item as={Link}>Something else</Dropdown.Item>
          </DropdownButton> */}
        </Box>
        <Box
          className={`${styles["friend-profile-bg"]} position-absolute z-0 top-0 h-100`}
          // style={{
          //   backgroundImage:
          //     "linear-gradient(to bottom, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.77)),url(/kaneki-2.gif)",
          //   backgroundSize: "100% 110%",
          //   backgroundRepeat: "no-repeat",
          //   opacity: 0.7,
          // }}
        ></Box>
      </Flex>
    </>
  );
};

export default FriendProfile;
