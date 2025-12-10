import GroupChatSidebarNav from "./GroupChatSidebarNav";
import { useLocation } from "react-router-dom";
import DmSidebarNavTop from "./DmSidebarNavTop";
import DmHistory from "./DmHistory";
import { Box, Button, Flex, Modal, Text, TextInput } from "@mantine/core";
import { IoPersonAddOutline } from "react-icons/io5";
import { useDisclosure } from "@mantine/hooks";
import styles from "../css/sidebar.module.css";
import { useAllFriends } from "../custom-hooks/useAllFriends";
import { useEffect } from "react";
import useDebounce from "../custom-hooks/useDebounce";
import { useState } from "react";
import { useSearchFriends } from "../custom-hooks/useSearchFriends";

const Sidebar = () => {
  const location = useLocation();
  const [opened, { open, close }] = useDisclosure(false);
  const [friendInp, setFriendInp] = useState("");
  const [debounceVal, setDebounceVal] = useState("");
  const { data, isSuccess } = useSearchFriends(debounceVal);
  const allFriends = [];

  const debouncedChange = useDebounce((val) => setDebounceVal(val), 700);

  // useEffect(() => {
  //   console.log("in effect", debounceVal);
  // }, [debounceVal]);

  useEffect(() => {
    if (!isSuccess) return;
    if (!data) return;

    console.log("data: ", data);
  }, [data]);

  return (
    <>
      <Flex
        // w={150}
        c={"white"}
        bg={"#121214"}
        direction={"column"}
        // className={styles["sidebar"]}
      >
        {location.pathname.includes("group-chat") ? (
          <>
            <Flex
              align={"center"}
              justify={"space-between"}
              px={"xs "}
              className={`${styles["sidebar-top"]}`}
            >
              <Text>Mf's Server</Text>
              <Text ms={"auto"}>
                <IoPersonAddOutline onClick={open} />
              </Text>
            </Flex>

            <TextInput
              value={friendInp}
              onChange={(event) => {
                const newVal = event.currentTarget.value.trim();
                setFriendInp((prev) => (newVal === prev ? prev : newVal));
                debouncedChange(newVal);
              }}
              label="Input label"
              description="Input description"
              placeholder="Input placeholder"
            />
            <Flex
              direction={"column"}
              align={"center"}
              className={`${styles["sidebar"]}`}
              mb={"sm"}
              p={"xs"}
              h={"100%"}
            >
              <GroupChatSidebarNav />
            </Flex>
          </>
        ) : (
          <>
            <Flex
              align={"center"}
              justify={"center"}
              className={`${styles["sidebar-top"]}`}
            >
              <Button
                // mt={10}
                // mb={10}
                // mr={10}
                // ml={10}
                variant={"filled"}
                radius={"sm"}
                color="dark"
                w={"90%"}
              >
                Find or start a conversation
              </Button>
            </Flex>
            <Flex
              direction={"column"}
              align={"center"}
              className={`${styles["sidebar"]} ${styles["dm-sidebar"]}  custom-scrollbar`}
              mb={"sm"}
              px={"sm"}
              py={"sm"}
              h={"100%"}
            >
              <DmSidebarNavTop />
              <DmHistory />
            </Flex>
          </>
        )}
      </Flex>
      <Modal opened={opened} onClose={close} title="Invite to Server"></Modal>
    </>
  );
};

export default Sidebar;
