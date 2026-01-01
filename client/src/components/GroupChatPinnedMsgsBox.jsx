import React, { useContext, useState } from "react";
import { RxDrawingPin, RxCross2 } from "react-icons/rx";
import { formatDate } from "../utils/index.js";
import { TbHeartBroken } from "react-icons/tb";
import { PulseLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import {
  Box,
  Center,
  Flex,
  Image,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";
import { useModalStore } from "../stores/useModalStore.js";
import { useGroupPinnedMessages } from "../custom-hooks/useGroupPinnedMessages.js";
import styles from "../css/pinned_msgs_box.module.css";

const GroupChatPinnedMsgsBox = ({ customOverlayRef, ref }) => {
  const { activeMsg } = useContext(DmPanelContext);
  const { groupId } = useParams();
  const open = useModalStore((s) => s.openPanelModalNotifier);
  const { data: pinnedMsgs } = useGroupPinnedMessages(groupId);
  const pinnedMsgBoxObj = useShowPinnedMsgBoxStore(
    (s) => s.pinnedMsgBoxObj.group
  );

  const handlePanelModalNotifier = (msg, type) => {
    activeMsg.current = { msg, type };
    open();
    customOverlayRef.current.display = "none";
  };

  return (
    <>
      {pinnedMsgBoxObj[groupId] && (
        <Paper
          ref={ref}
          withBorder
          shadow="xl"
          radius={"lg"}
          pb={"1rem"}
          className={styles.paper}
        >
          <Flex
            align={"center"}
            gap={"xs"}
            my={"sm"}
            pb={"sm"}
            className={styles["modal-header"]}
          >
            <RxDrawingPin className={styles["header-icon"]} />
            <Title order={3} fw={"600"}>
              Pinned Messages
            </Title>
          </Flex>
          {!pinnedMsgs ? (
            <PulseLoader color={"white"} />
          ) : !pinnedMsgs?.length ? (
            <>
              <TbHeartBroken className={styles["no-data"]} />
              <Center mb={"xl"}>
                <Text mt={"lg"}>
                  This chat doesnt have any pinned messages yet.
                </Text>
              </Center>
            </>
          ) : (
            <Stack
              gap={"xs"}
              py={"xs"}
              className={`${styles["stack"]} custom-scrollbar`}
            >
              {pinnedMsgs.map((msg, i) => (
                <Flex
                  align={"center"}
                  gap={"xs"}
                  p={"xs"}
                  bd={"1px solid rgb(255,255,255,25%)"}
                  bdrs={"sm"}
                  mx={"xs"}
                  key={msg.id}
                  className={`${styles["pinned-msg"]}`}
                >
                  <Image
                    src="https://placehold.co/40"
                    radius={"xl"}
                    height={40}
                    styles={{
                      root: {
                        width: 40,
                        alignSelf: "baseline",
                      },
                    }}
                  />
                  <Flex direction={"column"}>
                    <Flex align={"center"} gap={"xs"}>
                      <Text fw={"bold"}>{msg.display_name}</Text>
                      <span className={`timestamp text-muted`}>
                        {formatDate(msg.created_at)}
                        {/* 12/05/2023, 10:03 */}
                      </span>
                    </Flex>
                    <Text className={`message-content`}>{msg.message}</Text>
                  </Flex>
                  <Box className={styles.cross}>
                    <RxCross2
                      onClick={() => handlePanelModalNotifier(msg, "Unpin")}
                    />
                  </Box>
                </Flex>
              ))}
            </Stack>
          )}
        </Paper>
      )}
    </>
  );
};

export default GroupChatPinnedMsgsBox;
