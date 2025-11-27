import {
  Box,
  Flex,
  Image,
  Text,
  Modal,
  Button,
  UnstyledButton,
} from "@mantine/core";
import UserStatus from "./UserStatus";
import { CiSettings } from "react-icons/ci";
import { useDisclosure } from "@mantine/hooks";
import { UserContext } from "../contexts/UserContext.jsx";
import { useContext } from "react";
import { useState } from "react";
import SettingsModalMyAccount from "../components/SettingsModalMyAccount.jsx";
import SettingsModalSecurity from "../components/SettingsModalSecurity.jsx";
import SettingsModalLanguage from "../components/SettingsModalLanguage.jsx";
import styles from "../css/user_profile_bar.module.css";
import UserProfileBarDropdown from "./UserProfileBarDropdown.jsx";

const modalLinks = ["My Account", "Security", "Billings", "Language"];
const modalComponents = {
  "My Account": SettingsModalMyAccount,
  Security: SettingsModalSecurity,
  Language: SettingsModalLanguage,
};

const UserProfileBar = ({ ref }) => {
  const { user } = useContext(UserContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [activeModalLink, setActiveModalLink] = useState({
    i: 0,
    key: "My Account",
  });

  return (
    <>
      {/* <UserProfileBarDropdown /> */}
      <Flex
        className={styles["user-profile-bar"]}
        w={250}
        bdrs={"md"}
        mb={"sm"}
        ms={"xs"}
        px={"xs"}
        align={"center"}
      >
        <Flex w={"100%"} align={"center"}>
          <UserProfileBarDropdown />
          {/* <Box ms={"auto"}> */}
          <CiSettings
            className={styles["settings-icon"]}
            style={{
              fontSize: 24,
              marginLeft: "auto",
            }}
            onClick={open}
          />
          {/* </Box> */}
        </Flex>
      </Flex>
      {/* </UserProfileBarDropdown> */}
      <Modal
        size={"80%"}
        opened={opened}
        onClose={close}
        className="aaaa"
        title="User Settings"
        styles={{
          body: {
            padding: 0,
            height: "calc(100% - 60px)",
          },
          header: {
            backgroundColor: "#1a1a1e",
          },
          content: {
            height: "100%",
          },
        }}
      >
        <Flex
          w={"100%"}
          style={{
            minHeight: "100%",
          }}
        >
          <Box
            w={250}
            bg={"#1a1a1e"}
            p={"sm"}
            style={{
              flexGrow: 1,
            }}
          >
            <Flex mb={"xs"} align={"center"} gap={"xs"} h={75}>
              <Image
                src="https://placehold.co/50"
                w={50}
                h={50}
                radius={"xl"}
                alt=""
              />
              <Flex direction={"column"}>
                <Text fz={22}>{user?.display_name}</Text>
                <Text fz={12}>{user?.username}</Text>
              </Flex>
            </Flex>
            {/* <Text fz={10} className="text-muted">
              User Settings
            </Text> */}
            <Flex direction={"column"} gap={"xs"}>
              {modalLinks.map((e, i) => (
                <Box
                  key={i}
                  p={"sm"}
                  className={`${
                    styles[
                      activeModalLink.i === i
                        ? "active-modal-link"
                        : "modal-link"
                    ]
                  }`}
                  onClick={() =>
                    setActiveModalLink({
                      i,
                      key: e,
                    })
                  }
                >
                  {e}
                </Box>
              ))}
            </Flex>
          </Box>
          <Box w={"100%"} m={"xl"}>
            {Object.entries(modalComponents).map(([key, Component]) =>
              key === activeModalLink.key ? <Component key={key} /> : ""
            )}
          </Box>
        </Flex>
      </Modal>
    </>
  );
};

export default UserProfileBar;
