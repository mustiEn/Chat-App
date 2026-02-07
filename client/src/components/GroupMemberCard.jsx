import { Box, Flex, Image, Paper, Stack, Text } from "@mantine/core";
import { createPortal } from "react-dom";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";
import React from "react";
import { useEffect } from "react";
import { returnJoinDate } from "../utils";

const GroupMemberCard = ({ member, referenceEl }) => {
  const { x, y, strategy, refs } = useFloating({
    placement: "left",
    middleware: [
      offset(8), // gap from trigger
      flip(), // flip if no space
      shift({ padding: 8 }), // keep in viewport
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (referenceEl) {
      refs.setReference(referenceEl);
    }
  }, [referenceEl, refs]);

  return createPortal(
    <Paper
      w={300}
      // h={250}
      shadow="lg"
      ref={refs.setFloating}
      radius={"md"}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        // zIndex: 999999
        zIndex: 5,
        minHeight: 200,
      }}
    >
      {/* <Box w={"100%"} pos={"relative"}></Box> */}
      <Box
        bg={member?.background_color ?? "gray"}
        w={"100%"}
        h={120}
        bdrs={"md"}
      ></Box>
      <Box
        w={"100%"}
        h={"100%"}
        bg={"dark"}
        pos={"relative"}
        p={"lg"}
        bdrs={"md"}
      >
        <Image
          w={80}
          h={80}
          src={member?.profile ?? "https://placehold.co/80x80"}
          style={{
            borderRadius: "100%",
            position: "absolute",
            top: -45,
            left: 15,
            width: 70,
            height: 70,
          }}
        />
        <Stack mt={"md"} gap={0}>
          <Text fw={"bold"} fz={"h5"}>
            {member.display_name}
          </Text>
          <Text>{member.username}</Text>
          <Flex mt={"xs"} gap={"xs"} fz={"sm"}>
            Member since
            <div
              style={{
                fontStyle: "italic",
              }}
            >
              {returnJoinDate(member.userCreatedAt)}
            </div>
          </Flex>
          <Text
            fz={"sm"}
            fw={"bold"}
            style={{
              wordBreak: "break-all",
            }}
          >
            {member?.about_me} Lorem
          </Text>
        </Stack>
      </Box>
    </Paper>,
    document.body,
  );
};

export default GroupMemberCard;
