import React, { memo, useContext } from "react";
import { TbActivity } from "react-icons/tb";
import { IoAddCircleSharp } from "react-icons/io5";
import { LiaDownloadSolid } from "react-icons/lia";
import PopoverComponent from "./PopoverComponent";
import AppsModal from "./AppsModal";
import AddGroupModal from "./AddGroupModal";
import HeaderContext from "../contexts/HeaderContext";
import { Flex, Stack, Button, Text } from "@mantine/core";
import {
  NavLink as ReactNavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { CiLogout } from "react-icons/ci";
import styles from "../css/group_list.module.css";

const GroupList = memo(function Grouplist() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const setHeader = useContext(HeaderContext);
  const [isAppModalOpened, { open: openAppModal, close: closeAppModal }] =
    useDisclosure(false);
  const [isGroupModalOpened, { open: openGroupModal, close: closeGroupModal }] =
    useDisclosure(false);
  const modals = [
    {
      content: "Add a group",
      icon: <IoAddCircleSharp />,
      modalToggler: openGroupModal,
    },
    {
      content: "Download Apps",
      icon: <LiaDownloadSolid />,
      modalToggler: openAppModal,
    },
  ];
  const concatFirstLetters = (name) => {
    const splitName = name.split(" ");
    const result = splitName.reduce((acc, curr) => {
      acc += curr[0];
      return acc;
    }, "");

    return result;
  };
  const popOverContent = (content) => {
    return (
      <Stack>
        <Text fw={"bold"} className=" popover-content">
          {typeof content == "number" ? "Jack daniels" : content}
        </Text>
        {content && content?.is_muted && (
          <span className="text-muted" style={{ fontSize: "10px" }}>
            {content.is_muted}
          </span>
        )}
      </Stack>
    );
  };
  const popOverTrigger = (link, group = null, icon = null) => {
    return (
      <button
        // color={"dark"}
        className={
          pathname.includes(link)
            ? [styles.btn, styles.active].join(" ")
            : styles.btn
        }
        // onClick={() => setHeader(content)}
        onClick={() => navigate(link)}
      >
        <Flex justify={"center"} align={"center"} w={"100%"} h={"100%"}>
          {group ? (
            group?.image ? (
              <Image
                src={group?.image}
                alt={group?.name}
                w={30}
                h={30}
                radius={"50%"}
              />
            ) : (
              concatFirstLetters("Jack daniels")
            )
          ) : (
            icon
          )}
        </Flex>
      </button>
    );
  };
  const popOverModalTrigger = (icon, toggler) => {
    return (
      <Button
        color={"gray.8"}
        mx={"xs"}
        p={0}
        onClick={toggler}
        className={styles.btn}
        styles={{
          root: {
            width: 40,
            height: 35,
            fontSize: "var(--mantine-font-size-lg)",
          },
          label: {
            overflow: "unset",
          },
        }}
      >
        {icon}
      </Button>
    );
  };

  return (
    <>
      <Flex
        id={styles.groupList}
        direction={"column"}
        gap={"xs"}
        ms={"auto"}
        // ps={"xs"}
        // pl={"xs"}
      >
        <PopoverComponent
          content={popOverContent("Direct Messages")}
          trigger={popOverTrigger("/@me/friends", undefined, <TbActivity />)}
        />
        {Array.from({ length: 5 }, (_, group) => (
          <PopoverComponent
            key={group}
            content={popOverContent("Direct Messages")}
            trigger={popOverTrigger("/@me/group-chat", group + 1, undefined)}
          />
        ))}
        {modals.map(({ content, icon, modalToggler }, i) => (
          <PopoverComponent
            key={i}
            content={popOverContent(content)}
            trigger={popOverModalTrigger(icon, modalToggler)}
          />
        ))}
        <PopoverComponent
          content={popOverContent("Logout")}
          trigger={popOverTrigger("/logout", undefined, <CiLogout />)}
        />
      </Flex>
      <AppsModal
        show={openAppModal}
        close={closeAppModal}
        opened={isAppModalOpened}
      />
      <AddGroupModal
        show={openGroupModal}
        close={closeGroupModal}
        opened={isGroupModalOpened}
      />
    </>
  );
});

export default GroupList;
