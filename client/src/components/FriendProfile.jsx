import React from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Image, Text } from "@mantine/core";
import UserStatus from "./UserStatus";
import styles from "../css/friend_profile.module.css";
import { useReceiverStore } from "../stores/useReceiverStore";

const FriendProfile = ({ showOffset, friend }) => {
  const receivers = useReceiverStore((s) => s.receivers);
  const receiverStatus = receivers[friend.id]?.status;

  return (
    <>
      <Flex
        color="white"
        className={`${styles["offCanvas"]} ${showOffset ? styles["show"] : ""}`}
        direction={"column"}
        style={{
          flexShrink: 0,
        }}
      >
        <Box
          w={"100%"}
          bg={"dark"}
          className={`${styles["friend-profile-bg"]}`}
        ></Box>
        <Box
          h={"100%"}
          px={"sm"}
          // style={{
          //   backgroundColor: "transparent",
          // }}
          style={{
            backgroundColor: "rgb(27 26 26)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            w={80}
            h={80}
            style={{
              transform: "translateY(-55%)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              style={{
                position: "relative",
              }}
              w={80}
              h={80}
            >
              <Image src={"https://placehold.co/80"} radius={"100%"} />
              {receiverStatus && (
                <UserStatus
                  status={receiverStatus}
                  w={22}
                  h={22}
                  absolute={true}
                />
              )}
            </Box>
          </Box>
          <Box fw={"bold"} fz={20}>
            Dev2Github
          </Box>
          <Text>dev2github_43534</Text>
          <Box bg={"dark"} p={"sm"} bdrs={"sm"}>
            <Flex direction={"column"}>
              <Text fw={"bold"} style={{ fontSize: 12 }}>
                Member Since
              </Text>
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
          h={"100%"}
          className={`${styles["friend-profile-bg"]}  `}
          style={{
            // backgroundImage:
            //   "linear-gradient(to bottom, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.77)),url(/kaneki-2.gif)",
            // backgroundSize: "100% 110%",
            // backgroundRepeat: "no-repeat",
            // opacity: 0.7,
            position: "absolute",
            zIndex: 0,
            top: 0,
          }}
        ></Box>
      </Flex>
    </>
  );
};

export default FriendProfile;
