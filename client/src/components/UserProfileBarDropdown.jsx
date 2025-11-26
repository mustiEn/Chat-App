import { Button, getRefProp, Menu, Text } from "@mantine/core";
import React from "react";
import { useRef } from "react";
import UserProfileBarButton from "./UserProfileBarButton";

const UserProfileBarDropdown = () => {
  const ref = useRef(null);
  return (
    <Menu shadow="md" width={200} position="top">
      <Menu.Target>
        <UserProfileBarButton ref={ref} />
        {/* <Button>Toggle menu</Button> */}
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Application</Menu.Label>
        <Menu.Item>Settings</Menu.Item>
        <Menu.Item>Messages</Menu.Item>
        <Menu.Item>Gallery</Menu.Item>
        <Menu.Item
          rightSection={
            <Text size="xs" c="dimmed">
              ⌘K
            </Text>
          }
        >
          Search
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item>Transfer my data</Menu.Item>
        <Menu.Item color="red">Delete my account</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserProfileBarDropdown;
