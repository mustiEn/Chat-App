import { HiMiniUserGroup } from "react-icons/hi2";
import { Box, Flex, Text } from "@mantine/core";

const GroupInvitesTop = () => {
  return (
    <>
      <Box className="panel-top">
        <Flex
          h={"100%"}
          align={"center"}
          gap={"xs"}
          c={"white"}
          mr={10}
          ml={10}
        >
          <HiMiniUserGroup />
          <Text>Invites</Text>
        </Flex>
      </Box>
    </>
  );
};

export default GroupInvitesTop;
