import { FaRegEnvelope } from "react-icons/fa6";
import { Box, Flex, Text } from "@mantine/core";

const FriendRequestsTop = () => {
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
          <FaRegEnvelope />
          <Text>Requests</Text>
        </Flex>
      </Box>
    </>
  );
};

export default FriendRequestsTop;
