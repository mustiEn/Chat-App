import { Box, Button, Flex, Image, keys, Stack, Text } from "@mantine/core";
import React from "react";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import styles from "../css/friend_profile.module.css";

const SettingsModalMyAccount = () => {
  const { user } = useContext(UserContext);
  const userDetails = {
    "Display Name": user?.display_name,
    Username: user?.username,
    Email: user?.email,
    "Phone Number": user?.phone_number ?? "You havent add ur phone yet",
    "Age Group": user?.age_group ?? "adult",
  };

  return (
    <>
      <Flex
        h={"100%"}
        direction={"column"}
        bdrs={"md"}
        style={{
          position: "relative",
        }}
      >
        <Box
          w={"100%"}
          bg={"dark"}
          h={100}
          className={`${styles["friend-profile-bg"]}`}
          style={{
            flexShrink: 0,
            borderRadius:
              "var(--mantine-radius-md) var(--mantine-radius-md) 0 0",
          }}
        ></Box>
        <Box
          h={"100%"}
          px={"sm"}
          pb={"sm"}
          className="position-relative z-1"
          // style={{
          //   backgroundColor: "transparent",
          // }}
          style={{
            backgroundColor: "rgb(27 26 26)",
            borderRadius:
              "0 0 var(--mantine-radius-md) var(--mantine-radius-md) ",
          }}
        >
          <Flex
            gap={"xs"}
            align={"center"}
            style={{
              transform: "translateY(-25%)",
            }}
            className="position-relative z-1"
          >
            <Image
              w={80}
              h={80}
              src={"https://placehold.co/80"}
              radius={"100%"}
            />
            <Text fw={"bold"} fz={26} ms={"sm"}>
              {user?.display_name}
            </Text>
            <Text>{user?.username}</Text>
          </Flex>
          <Stack w={"100%"} bg={"dark"} p={"md"}>
            {Object.entries(userDetails).map(([key, val]) => (
              <Flex align={"center"} key={key}>
                <Flex direction={"column"}>
                  <Text>{key}</Text>
                  <Text>{val}</Text>
                </Flex>
                <Button color={"dark"} ms={"auto"}>
                  Edit
                </Button>
              </Flex>
            ))}
          </Stack>
        </Box>
      </Flex>
    </>
  );
};

export default SettingsModalMyAccount;
