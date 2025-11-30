import { Box, Flex, Image, Text } from "@mantine/core";
import React from "react";
import { UserContext } from "../contexts/UserContext";
import { useContext } from "react";
import styles from "../css/user_profile_bar.module.css";
import UserStatus from "../components/UserStatus.jsx";

const UserProfileBarButton = ({ ref, ...props }) => {
  const { user } = useContext(UserContext);
  //? get rid of bootstrap
  return (
    <button {...props} className={styles["user-profile-bar-btn"]} ref={ref}>
      <Flex
        className={styles["image-username"]}
        w={"80%"}
        ps={"xs"}
        align={"center"}
        bdrs={"sm"}
        gap={"xs"}
      >
        <Box
          style={{
            position: "relative",
          }}
        >
          <Image
            src="https://placehold.co/32"
            w={32}
            h={32}
            radius={"xl"}
            alt=""
          />
          {user?.status && (
            <UserStatus status={user.status} w={10} h={10} absolute={true} />
          )}
        </Box>
        <Box>
          <Text fw={"bold"}>{user?.display_name}</Text>
          <Box
            style={{
              width: 50,
              height: 15,
              position: "relative",
              overflow: "clip",
            }}
          >
            <Flex
              direction={"column"}
              className={styles.username}
              style={{
                position: "absolute",
              }}
            >
              <Text fz={10}>{user?.status}</Text>
              <Text fz={10}>{user?.username}</Text>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </button>
  );
};

export default UserProfileBarButton;
