import { Box, Button, Divider, Stack, Text } from "@mantine/core";
import React from "react";
import { socket } from "../socket";
import { useParams } from "react-router-dom";
import { useGroupMembers } from "../custom-hooks/useGroupMembers";
import GroupMemberItem from "./GroupMemberItem";
import DmHistorySkeleton from "./DmHistorySkeleton";

const GroupChatLastJoins = () => {
  const { groupId } = useParams();
  const { data, isLoading } = useGroupMembers(groupId);
  const lastJoinedMembers = data?.lastJoins ?? [];

  return (
    <>
      <Box w={"100%"} mt={"xs"} h={300}>
        <Text>Last Joins</Text>
        {isLoading ? (
          <DmHistorySkeleton />
        ) : lastJoinedMembers.length ? (
          <Stack mt={"xs"} gap={0} w={"100%"} h={"100%"}>
            {lastJoinedMembers.map((e) => (
              <div
                style={{
                  height: 45,
                }}
              >
                <GroupMemberItem member={e} />
              </div>
            ))}
          </Stack>
        ) : (
          <Text>No history found</Text>
        )}
      </Box>
      <Button
        onClick={() => {
          socket.disconnect();
        }}
      >
        close
      </Button>
      <Button onClick={() => socket.connect()}>connect</Button>
    </>
  );
};

export default GroupChatLastJoins;
