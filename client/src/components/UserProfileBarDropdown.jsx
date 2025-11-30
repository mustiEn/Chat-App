import { Button, getRefProp, Group, Menu, Text } from "@mantine/core";
import React from "react";
import { useRef } from "react";
import UserProfileBarButton from "./UserProfileBarButton";
import UserStatus from "./UserStatus";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { socket } from "../socket.js";
import { toast } from "react-hot-toast";
const UserProfileBarDropdown = ({ open }) => {
  const ref = useRef(null);
  const { user } = useContext(UserContext);

  const handleUserStatus = (status) => {
    if (!socket.connected) toast.error("Something went wrong");

    socket.emit("send changed user status", status, (err, res) => {
      if (err || res.error) {
        toast.error(res.status);
        return;
      }
    });
  };

  return (
    <Menu shadow="md" width={200} position="top">
      <Menu.Target>
        <UserProfileBarButton ref={ref} />
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>User Menu</Menu.Label>
        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item>
              {user?.status && (
                <Group gap={"xs"}>
                  <UserStatus
                    status={user.status}
                    w={15}
                    h={15}
                    absolute={false}
                  />
                  {user.status}
                </Group>
              )}
            </Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown>
            <Menu.Item onClick={() => handleUserStatus("Online")}>
              <Group gap={"xs"}>
                <UserStatus status={"Online"} w={15} h={15} absolute={false} />
                <div>Online</div>
              </Group>
            </Menu.Item>
            <Menu.Divider></Menu.Divider>
            <Menu.Item onClick={() => handleUserStatus("Idle")}>
              <Group gap={"xs"}>
                <UserStatus status={"Idle"} w={15} h={15} absolute={false} />
                <div>Idle</div>
              </Group>
            </Menu.Item>
            <Menu.Item onClick={() => handleUserStatus("Invisible")}>
              <Group gap={"xs"}>
                <UserStatus
                  status={"Invisible"}
                  w={15}
                  h={15}
                  absolute={false}
                />
                <div>Invisible</div>
              </Group>
            </Menu.Item>
          </Menu.Sub.Dropdown>
        </Menu.Sub>

        <Menu.Divider />
        <Menu.Item onClick={open}>Edit Account</Menu.Item>
        <Menu.Item>Switch Accounts</Menu.Item>
        <Menu.Item>Log out</Menu.Item>
        <Menu.Item color="red">Delete my account</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserProfileBarDropdown;
