import {
  Box,
  Button,
  Center,
  Flex,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { IoPersonAddOutline } from "react-icons/io5";
import GroupChatSidebarNav from "./GroupChatSidebarNav";
import { useGroupStore } from "../stores/useGroupStore";
import { useParams } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { useSearchFriends } from "../custom-hooks/useSearchFriends";
import useDebounce from "../custom-hooks/useDebounce";
import { useAllFriends } from "../custom-hooks/useAllFriends";
import { IoSearch } from "react-icons/io5";
import styles from "../css/sidebar.module.css";
import groupChatSidebarStyles from "../css/group_chat_sidebar.module.css";
import { PulseLoader } from "react-spinners";
import PopoverComponent from "./PopoverComponent";
import { useGroups } from "../custom-hooks/useGroups";

const GroupChatSidebar = () => {
  const { groupId } = useParams();
  const { data: groups } = useGroups();
  const [opened, { open, close }] = useDisclosure(false);
  const [friendInp, setFriendInp] = useState("");
  const [debounceVal, setDebounceVal] = useState("");
  const { data, isFetching } = useSearchFriends(debounceVal, groupId);
  const debouncedChange = useDebounce((val) => setDebounceVal(val), 700);
  const group = groups?.find(({ group_id }) => group_id == groupId) ?? [];
  // const showSpinner = useDelayedSpinner(isFetching);

  //? dont list those who are alredy in the froup
  return (
    <>
      <Flex
        align={"center"}
        justify={"space-between"}
        px={"xs"}
        className={`${styles["sidebar-top"]}`}
      >
        <Text>{group?.group_name}</Text>
        <Box ms={"auto"}>
          <PopoverComponent
            trigger={<IoPersonAddOutline onClick={open} />}
            content={"Invite to Server"}
            position="left"
          />
        </Box>
      </Flex>
      <Flex
        direction={"column"}
        align={"center"}
        className={`${styles["sidebar"]}`}
        mb={"sm"}
        p={"xs"}
        h={"100%"}
      >
        <GroupChatSidebarNav group={group} />
      </Flex>
      <Modal
        opened={opened}
        onClose={close}
        title="Invite to Server"
        centered
        styles={{
          content: {
            height: 530,
            display: "flex",
            flexDirection: "column",
          },
          body: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 0,
            overflow: "hidden",
          },
        }}
      >
        <Box mx={"md"}>
          <TextInput
            value={friendInp}
            onChange={(event) => {
              const newVal = event.currentTarget.value.trim();
              setFriendInp((prev) => (newVal === prev ? prev : newVal));
              debouncedChange(newVal);
            }}
            label="Friend name"
            placeholder="Search a friend"
            leftSection={<IoSearch />}
            // w={"100%"}
          />
          <Box
            className={`custom-scrollbar ${groupChatSidebarStyles["friends-list"]}`}
            w={"100%"}
            h={"18rem"}
            my={"xs"}
          >
            {isFetching ? (
              <Center mt={"xl"}>
                <PulseLoader color="white" />
              </Center>
            ) : data?.nonMemberFriends.length ? (
              <Stack gap={"xs"}>
                {data?.nonMemberFriends.map((e) => (
                  <Flex
                    gap={"xs"}
                    key={e.id}
                    align={"center"}
                    className={groupChatSidebarStyles.friend}
                    p={4}
                  >
                    <Image
                      src={e?.profile_photo ?? "https://placehold.co/32x32"}
                      radius={"xl"}
                      w={32}
                      h={32}
                    />
                    <Text>{e.display_name}</Text>
                    <Button size="xs" ms={"auto"}>
                      Invite
                    </Button>
                  </Flex>
                ))}
              </Stack>
            ) : debounceVal === "" ? (
              <Center mt={"xl"}>
                <Text>You'll find your friends here!</Text>
              </Center>
            ) : (
              <Box>No results</Box>
            )}
          </Box>
        </Box>
        <Box
          w={"100%"}
          mt={"auto"}
          p={"md"}
          className={`${groupChatSidebarStyles["modal-footer"]}`}
        >
          <Text>Or send a server invite link to a friend</Text>

          <Group my={"sm"}>
            <TextInput
              value={"XABCJW"}
              readOnly
              className={`${groupChatSidebarStyles["modal-footer-input"]}`}
            />
            <Button>Copy</Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
};

export default GroupChatSidebar;
