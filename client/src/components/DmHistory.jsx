import PopoverComponent from "./PopoverComponent";
import { IoAdd } from "react-icons/io5";
import DmHistoryUsers from "./DmHistoryUsers";
import { socket } from "../socket";
import { Box, Button, Flex, Space, Text } from "@mantine/core";

const DmHistory = () => {
  const popOverContent = () => {
    return (
      <Flex direction={"column"}>
        <Text fw={"bold"} className="popover-content">
          Create DM
        </Text>
      </Flex>
    );
  };
  const popOverTrigger = () => {
    return (
      <div>
        <IoAdd />
      </div>
    );
  };

  return (
    <>
      <Box w={"100%"}>
        <Flex justify={"space-between"} my={"xs"} c={"white"}>
          <Text>Direct Messages</Text>
          <PopoverComponent
            trigger={popOverTrigger()}
            content={popOverContent()}
          />
        </Flex>
        <DmHistoryUsers />
        <Space h={"lg"}></Space>
        <Button
          onClick={() => {
            socket.disconnect();
          }}
        >
          close
        </Button>
        <Button onClick={() => socket.connect()}>connect</Button>
      </Box>
    </>
  );
};

export default DmHistory;
