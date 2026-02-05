import React, { memo, useContext } from "react";
import { TbActivity } from "react-icons/tb";
import { IoAddCircleSharp } from "react-icons/io5";
import { LiaDownloadSolid } from "react-icons/lia";
import PopoverComponent from "./PopoverComponent";
import AppsModal from "./AppsModal";
import AddGroupModal from "./AddGroupModal";
import { Flex, Stack, Button, Text, Image } from "@mantine/core";
import {
  Link,
  NavLink as ReactNavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { CiLogout } from "react-icons/ci";
import styles from "../css/group_list.module.css";
import { useGroups } from "../custom-hooks/useGroups";
import { useEffect } from "react";
import { concatFirstGroupLetters } from "../utils";
import { socket } from "../socket";

const GroupList = memo(function Grouplist() {
  const { data: groups, isLoading, isSuccess } = useGroups();
  const { pathname } = useLocation();
  const navigate = useNavigate();
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
    // console.log(group);

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
            group?.group_icon ? (
              <Image
                src={group.group_icon}
                alt={group.group_name}
                w={30}
                h={30}
                radius={"50%"}
              />
            ) : (
              concatFirstGroupLetters(group?.group_name ?? "jack d")
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

  useEffect(() => {
    if (!isSuccess) return;
    if (!groups.length) return;

    groups.forEach(({ group_id }) => {
      socket.auth.serverOffset.groups[group_id] = null;
    });
  });

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
        {/* {Array.from({ length: 5 }, (_, group) => (
          <PopoverComponent
            key={group}
            content={popOverContent("Direct Messages")}
            trigger={popOverTrigger("/@me/gc/1", group + 1, undefined)}
          />
        ))} */}
        {isLoading ? (
          <div>Loading</div>
        ) : (
          groups.map((group) => (
            <PopoverComponent
              key={group.id}
              content={popOverContent(group.group_name)}
              trigger={popOverTrigger(
                `/@me/gc/${group.group_id}`,
                group,
                undefined,
              )}
            />
          ))
        )}
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
        <Link
          to={"/community-guidelines"}
          style={{
            color: "white",
          }}
        >
          Community
        </Link>
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
