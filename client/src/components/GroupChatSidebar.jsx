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
import GroupInviteModal from "./GroupInviteModal";

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
        {!group?.id ? (
          <PulseLoader color="white" />
        ) : (
          <GroupChatSidebarNav group={group} />
        )}
      </Flex>
      <GroupInviteModal opened={opened} close={close} />
    </>
  );
};

export default GroupChatSidebar;
