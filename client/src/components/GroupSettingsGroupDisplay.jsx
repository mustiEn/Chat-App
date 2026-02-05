import { Box, Flex, Group, Stack, Text } from "@mantine/core";
import React from "react";
import { concatFirstGroupLetters } from "../utils";
import styles from "../css/group_settings_modal_group_display.module.css";

const GroupSettingsGroupDisplay = ({
  croppedPreview,
  groupState,
  membersCount,
}) => {
  return (
    <>
      <Box w={"100%"} h={"100%"} pos={"relative"}>
        <Box
          h={"50%"}
          style={{
            borderRadius:
              "var(--mantine-radius-lg) var(--mantine-radius-lg) 0 0",
            backgroundImage: `linear-gradient(180deg, ${groupState.background_color ?? "black"}, var(--default-group-bg-bottom))`,
          }}
        ></Box>
        <Box
          pos={"relative"}
          bg={"dark"}
          style={{
            borderRadius:
              "0 0 var(--mantine-radius-lg) var(--mantine-radius-lg)",
            minHeight: "50%",
          }}
        >
          {croppedPreview ? (
            <img className={styles["group-icon"]} src={croppedPreview} />
          ) : groupState.group_icon ? (
            <img
              className={styles["group-icon"]}
              src={
                groupState.group_icon
                  ? `/images/${groupState.group_icon}`
                  : "https://placehold.co/70x70"
              }
            />
          ) : (
            <Flex className={styles["group-default-icon"]}>
              {concatFirstGroupLetters(groupState.group_name)}
            </Flex>
          )}

          <Box pl={"md"} pr={"md"} pt={"xl"} pb={"md"}>
            <Stack gap={3}>
              <Text fw={"bold"}>{groupState.group_name}</Text>
              <Group>
                <Box w={10} h={10} bg={"gray"}></Box>
                <Text>
                  {membersCount} {membersCount <= 1 ? "Member" : "Members"}
                </Text>
              </Group>
              <Text>Sept 2022</Text>
              {groupState.description && (
                <Text
                  style={{
                    wordBreak: "break-all",
                  }}
                >
                  {groupState.description}
                </Text>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default GroupSettingsGroupDisplay;
