import { Box, Button, Flex, Text, TextInput } from "@mantine/core";

const AddFriend = () => {
  return (
    <>
      <Flex className="d-flex w-100">
        <Box>
          <Text fz={"h4"}>Add Friend</Text>
          <p>You can add friends with their Discord usernames.</p>
          <Box className="border-bottom border-white border-opacity-25 px-2">
            <TextInput
              type="text"
              placeholder="Enter your friend's usenrame."
            />
            <Button variant="dark">Send Friend Request</Button>
          </Box>
        </Box>
        <Box>
          <Text fz={"h4"}>Other Places to Make Friends</Text>
          <p>
            Don't have a username ? Cheak out our list of groups you can join
          </p>
        </Box>
        <Button variant="dark">Explore Groups</Button>
      </Flex>
    </>
  );
};

export default AddFriend;
