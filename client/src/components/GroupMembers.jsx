import React from "react";
import { useGroupMembers } from "../custom-hooks/useGroupMembers";
import { useParams } from "react-router-dom";
import { Box, Flex, Image, Stack, Text } from "@mantine/core";
import UserStatus from "./UserStatus";
import { PulseLoader } from "react-spinners";
import { concatName } from "../utils";

const GroupMembers = ({ showOffset }) => {
  const { groupId } = useParams();
  const { data, isLoading } = useGroupMembers(groupId);

  return (
    <>
      {isLoading ? (
        <PulseLoader color={"white"} />
      ) : (
        <Stack>
          {data.members.map((member) => (
            <Box
              key={member.id}
              color={"dark"}
              w={"100%"}
              h={"100%"}
              justify="flex-start"
              style={{
                position: "relative",
              }}
            >
              <Box
                w={"100%"}
                h={"100%"}
                style={{
                  // backgroundImage: "url(/atomic.gif)",
                  zIndex: 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "100% 30%",
                  maskImage:
                    "linear-gradient(to left, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0))",
                  WebkitMaskImage:
                    "linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0))",
                }}
              ></Box>
              <Flex
                align={"center"}
                gap={"xs"}
                style={{
                  position: "absolute",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 32,
                    height: 32,
                  }}
                >
                  <Image
                    src={member.profile ?? "https://placehold.co/32"}
                    radius={"xl"}
                    alt=""
                  />
                  {member.status && (
                    <UserStatus
                      status={member.status}
                      w={12}
                      h={12}
                      absolute={true}
                    />
                  )}
                </div>
                <Text>{concatName(member.display_name)}</Text>
              </Flex>
            </Box>
          ))}
        </Stack>
      )}
    </>
  );
};

export default GroupMembers;
