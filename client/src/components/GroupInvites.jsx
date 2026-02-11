import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDate } from "../utils/index.js";
import { socket } from "../socket";
import { IoCheckmarkOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import { Box, Flex, Text, Button, Stack, Image } from "@mantine/core";
import { removeGroupInvites } from "../utils/groupInvites.js";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import { useHeaderStore } from "../stores/useHeaderStore.js";
import GroupInvitesTop from "./GroupInvitesTop.jsx";
import { useGroupInvites } from "../custom-hooks/useGroupInvites.js";
import styles from "../css/group_invites.module.css";

const GroupInvites = () => {
  const queryClient = useQueryClient();

  const handleInviteAcceptance = (status, invite) => {
    const emitData = {
      senderId: invite.user_id,
      groupId: invite.group_id,
      status,
    };
    const handleEmitCallback = (err, res) => {
      if (err || res.status === "duplicated" || res.status === "error") {
        console.log("Invite failed:", err, res.error);
        toast.error(res.error);
        return;
      }

      socket.emit("join group", invite.group_id);

      socket.auth.serverOffset.groups[invite.id] = null;
      queryClient.refetchQueries({ queryKey: ["groups"] });
      toast.success(`Invite request ${status}`);
    };
    removeGroupInvites(queryClient, invite.user_id, invite.group_id);

    socket.emit("send group invite acceptance", emitData, (err, res) =>
      handleEmitCallback(err, res),
    );
  };
  const { data, isLoading } = useGroupInvites();
  const groupInvites = data?.groupInvites ?? [];
  const setHeader = useHeaderStore((s) => s.setHeader);

  useEffect(() => {
    setHeader("Group Invites");
  }, []);

  return (
    <>
      <GroupInvitesTop />
      <Box p={"sm"}>
        <Text mb={"sm"} fw={"lighter"}>
          Group Invites
        </Text>
        {isLoading ? (
          <div>Loading...</div>
        ) : !groupInvites.length ? (
          <div>No data</div>
        ) : (
          <Stack gap={0}>
            {groupInvites.map((invite) => (
              <Flex
                className={styles.invite}
                align={"center"}
                gap={"xs"}
                p={7}
                key={invite.id}
              >
                <Flex direction={"column"} w={"100%"}>
                  <Text>You are invited to </Text>
                  <Text fw={"bold"} fs={"italic"}>
                    {invite.group_name}{" "}
                  </Text>
                  <Text>by </Text>
                  <Text>{invite.display_name}</Text>
                </Flex>
                <Flex
                  className={[styles.btn, styles.accept].join(" ")}
                  align={"center"}
                  justify={"center"}
                  w={50}
                  h={50}
                  bdrs={"xl"}
                  ms={"auto"}
                  onClick={() => handleInviteAcceptance("accepted", invite)}
                >
                  <IoCheckmarkOutline className={styles.icon} />
                </Flex>
                <Flex
                  className={[styles.btn, styles.reject].join(" ")}
                  w={50}
                  h={50}
                  align={"center"}
                  justify={"center"}
                  bdrs={"xl"}
                  onClick={() => handleInviteAcceptance("rejected", invite)}
                >
                  <RxCross1 className={styles.icon} />
                </Flex>
              </Flex>
            ))}
          </Stack>
        )}
      </Box>
    </>
  );
};

export default GroupInvites;
