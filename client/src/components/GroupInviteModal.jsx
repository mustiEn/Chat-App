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
import { useParams } from "react-router-dom";
import { useSearchFriends } from "../custom-hooks/useSearchFriends";
import useDebounce from "../custom-hooks/useDebounce";
import { IoSearch } from "react-icons/io5";
import { PulseLoader } from "react-spinners";
import styles from "../css/group_chat_sidebar.module.css";
import { useState } from "react";
import { socket } from "../socket";
import toast from "react-hot-toast";

const GroupInviteModal = ({ opened, close }) => {
  const { groupId } = useParams();
  const [friendInp, setFriendInp] = useState("");
  const [debounceVal, setDebounceVal] = useState("");
  const { data, isFetching } = useSearchFriends(debounceVal, groupId);
  const nonMemberFriends = data?.nonMemberFriends ?? [];
  const [isSending, setIsSending] = useState([]);
  const debouncedChange = useDebounce((val) => setDebounceVal(val), 700);
  const sendInvite = (receiverId) => {
    socket.emit("send group invite", groupId, receiverId, (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        console.log("Invite failed:", err, res.error);
        toast.error(res.error);
        return;
      }

      toast.success("Invite sent");
      setIsSending((prev) => prev.filter((e) => e != receiverId));
    });
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Invite to Group"
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
            className={`custom-scrollbar ${styles["friends-list"]}`}
            w={"100%"}
            h={"18rem"}
            my={"xs"}
          >
            {isFetching ? (
              <Center mt={"xl"}>
                <PulseLoader color="white" />
              </Center>
            ) : nonMemberFriends.length ? (
              <Stack gap={"xs"}>
                {nonMemberFriends.map((e) => (
                  <Flex
                    gap={"xs"}
                    key={e.id}
                    align={"center"}
                    className={styles.friend}
                    p={4}
                  >
                    <Image
                      src={e?.profile_photo ?? "https://placehold.co/32x32"}
                      radius={"xl"}
                      w={32}
                      h={32}
                    />
                    <Text>{e.display_name}</Text>
                    <Button
                      size="xs"
                      ms={"auto"}
                      onClick={() => sendInvite(e.id)}
                      disabled={isSending.includes(e.id)}
                    >
                      {isSending.includes(e.id) ? "Sending" : "Invite"}
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
          className={`${styles["modal-footer"]}`}
        >
          <Text>Or send a group invite link to a friend</Text>

          <Group my={"sm"}>
            <TextInput
              value={"XABCJW"}
              readOnly
              className={`${styles["modal-footer-input"]}`}
            />
            <Button>Copy</Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
};

export default GroupInviteModal;
