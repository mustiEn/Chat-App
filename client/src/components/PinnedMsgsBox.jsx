import React, { useContext, useState } from "react";
import { RxDrawingPin, RxCross2 } from "react-icons/rx";
import { formatDate } from "../utils";
import { TbHeartBroken } from "react-icons/tb";
import { PulseLoader } from "react-spinners";
import DmModalNotifier from "./DmModalNotifier";
import { socket } from "../socket";
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
import styles from "../css/pinned_msgs_box.module.css";
import { usePinnedMessages } from "../custom-hooks/usePinnedMessages.js";

const PinnedMsgsBox = ({ customOverlayRef, ref }) => {
  const { userId: receiverId } = useParams();
  const { setActiveMsg, open } = useContext(DmPanelContext);

  const { data: pinnedMsgs } = usePinnedMessages(receiverId);
  const showPinnedMsgBox = useShowPinnedMsgBoxStore((s) => s.showPinnedMsgBox);

  const handleDmModalNotifier = (msg, type) => {
    setActiveMsg({ msg, type });
    open();
    customOverlayRef.current.display = "none";
  };

  return (
    <>
      <Paper
        ref={ref}
        withBorder
        shadow="xl"
        radius={"lg"}
        pb={"1rem"}
        className={showPinnedMsgBox[receiverId] ? `${styles.paper}` : "d-none"}
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
                    onClick={() => handleDmModalNotifier(msg, "Unpin")}
                  />
                </Box>
              </Flex>
            ))}
          </Stack>
        )}
      </Paper>
    </>
  );
};

export default PinnedMsgsBox;
