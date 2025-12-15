import { useDisclosure } from "@mantine/hooks";
import {
  Modal,
  Button,
  Center,
  FileInput,
  Text,
  Stack,
  Box,
} from "@mantine/core";
import { addGroupMutation } from "../mutations/addGroupMutation";
import { useRef, useState } from "react";
import { MdOutlinePhotoCamera } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";
const AddGroupModal = ({ opened, open, close }) => {
  const [serverInfo, setServerInfo] = useState({
    name: "",
    icon: null,
  });
  const fileInpRef = useRef(null);
  const queryClient = useQueryClient();
  const addGroup = addGroupMutation(queryClient);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Create Your Group">
        <Center>
          <Text>
            Give your group a name and an icon. You can always change them later
          </Text>
        </Center>

        <Box>
          <input type="file" name="" id="" ref={fileInpRef} hidden />
          <Stack bd={"1px solid red"} w={75} h={75}>
            <MdOutlinePhotoCamera
              // style={{
              //   position: "absolute",
              // }}
              onClick={() => fileInpRef.current.click()}
            />
            <Text>UPLOAD</Text>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default AddGroupModal;
