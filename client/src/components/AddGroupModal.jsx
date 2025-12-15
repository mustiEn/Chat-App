import { useDisclosure } from "@mantine/hooks";
import {
  Modal,
  Button,
  Center,
  FileInput,
  Text,
  Stack,
  Box,
  TextInput,
  Anchor,
  Flex,
  Image,
} from "@mantine/core";
import { addGroupMutation } from "../mutations/addGroupMutation";
import { useRef, useState } from "react";
import { MdOutlinePhotoCamera } from "react-icons/md";
import { useQueryClient } from "@tanstack/react-query";
import styles from "../css/add_group_modal.module.css";
import { useForm } from "@mantine/form";
import { useEffect } from "react";

const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

const AddGroupModal = ({ opened, open, close }) => {
  const form = useForm({
    mode: "controlled",
    initialValues: { icon: null, name: "" },

    validate: {
      icon: (val) => {
        if (!val) return null;
        return allowedFileTypes.includes(val.type) ? null : "Invalid file type";
      },
      name: (val) =>
        val.length < 2
          ? "Min 2 characters"
          : val.length > 75
          ? "Max 75 characters"
          : null,
    },
  });
  const [preview, setPreview] = useState(null);
  const fileInpRef = useRef(null);
  const queryClient = useQueryClient();
  const addGroup = addGroupMutation(queryClient, close, form);

  useEffect(() => {
    if (!form.values.icon) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(form.values.icon);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.values.icon]);

  return (
    <>
      <Modal
        centered
        opened={opened}
        onClose={() => {
          close();
          form.reset();
        }}
        title="Create Your Group"
        w={250}
      >
        <Text ta={"center"} fz={"sm"}>
          Give your group a name and an icon. You can always change them later
        </Text>
        <form
          onSubmit={form.onSubmit((values) => {
            const formData = new FormData();
            formData.append("name", values.name);

            if (values.icon) formData.append("icon", values.icon);

            addGroup.mutate(formData);
            console.log(values, formData);
          })}
          encType="multipart/form-data"
        >
          <Flex
            my={"md"}
            direction={"column"}
            align={"center"}
            justify={"center"}
          >
            <Box className={styles["file-input-box"]}>
              <Box display={"none"}>
                <FileInput
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  ref={fileInpRef}
                  error={null}
                  key={form.key("icon")}
                  {...form.getInputProps("icon")}
                />
              </Box>

              <Stack
                w={75}
                h={75}
                align="center"
                justify="center"
                gap={0}
                className={!preview && styles["file-input-stack"]}
                onClick={() => fileInpRef.current.click()}
              >
                {preview ? (
                  <Image src={preview} w={75} h={75} radius={"100%"} />
                ) : (
                  <>
                    <MdOutlinePhotoCamera
                      style={{
                        fontSize: 18,
                      }}
                    />
                    <Text fz={"xs"}>UPLOAD</Text>
                  </>
                )}
              </Stack>
            </Box>
            {form.errors?.icon && (
              <Text c="red.8" fz="xs" mt={4}>
                {form.errors.icon}
              </Text>
            )}
          </Flex>
          <TextInput
            label={"Group Name"}
            placeholder="Your Group Name"
            withAsterisk
            key={form.key("name")}
            {...form.getInputProps("name")}
          />
          <Text fz={"10"} c="gray.6" mt={"xs"}>
            By creating a group, you agree to MyChat's
            <Anchor href="/community-guidelines" target="_blank" fz={"10"}>
              {" "}
              Community Guidelines
            </Anchor>
          </Text>
          <Flex mt={"md"}>
            <Button ms={"auto"} type="submit">
              Create
            </Button>
          </Flex>
        </form>
      </Modal>
    </>
  );
};

export default AddGroupModal;
