import React, { memo, useContext, useMemo, useState } from "react";
import { useLoaderData, useLocation } from "react-router-dom";
import { TbActivity } from "react-icons/tb";
import { IoAddCircleSharp } from "react-icons/io5";
import { LiaDownloadSolid } from "react-icons/lia";
import PopoverComponent from "./PopoverComponent";
import "../css/server_list.css";
import AppsModal from "./AppsModal";
import AddServerModal from "./AddServerModal";
import HeaderContext from "../contexts/HeaderContext";
import { Flex, Stack, Button, Text, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

const ServerList = memo(function Serverlist() {
  // const servers = useLoaderData();
  // const servers = Array.from({length:5})
  const setHeader = useContext(HeaderContext);
  const [isAppModalOpened, { open: openAppModal, close: closeAppModal }] =
    useDisclosure(false);
  const [
    isServerModalOpened,
    { open: openServerModal, close: closeServerModal },
  ] = useDisclosure(false);
  const modals = [
    {
      content: "Add a server",
      icon: <IoAddCircleSharp />,
      modalToggler: openServerModal,
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
  const popOverTrigger = (link, server = null, icon = null) => {
    return (
      <NavLink
        color={"dark"}
        // className={"d-flex justify-content-center align-items-center mx-1 p-0"}
        // style={{ width: 40, height: 35, fontSize: 20 }}
        mx={"xs"}
        p={0}
        styles={{
          root: {
            width: 40,
            height: 35,
            fontSize: 16,
          },
          label: {
            overflow: "unset",
          },
        }}
        // onClick={() => setHeader(content)}
        // as={NavLink}

        href={link}
        label={
          server ? (
            server?.image ? (
              <img
                src={server?.image}
                alt={server?.name}
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
              />
            ) : (
              concatFirstLetters("Jack daniels")
            )
          ) : (
            icon
          )
        }
      />
    );
  };
  const popOverModalTrigger = (icon, toggler) => {
    return (
      <Button
        color={"dark"}
        mx={"xs"}
        p={0}
        onClick={toggler}
        styles={{
          root: {
            width: 40,
            height: 35,
            fontSize: 16,
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
        id="serverList"
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
        <PopoverComponent
          content={popOverContent("Direct Messages")}
          trigger={popOverTrigger("/logout", undefined, <TbActivity />)}
        />
        {Array.from({ length: 5 }, (_, server) => (
          <PopoverComponent
            key={server}
            content={popOverContent(server + 1)}
            trigger={popOverTrigger(
              "/@me/group-chat",
              server + 1,
              undefined,
              "Jack Daniels"
            )}
          />
        ))}
        {modals.map(({ content, icon, modalToggler }, i) => (
          <PopoverComponent
            key={i}
            content={popOverContent(content)}
            trigger={popOverModalTrigger(icon, modalToggler)}
          />
        ))}
        {/* <PopoverComponent
          content={popOverContent("Add a server")}
          trigger={popOverModalTrigger(<IoAddCircleSharp />)}
        />
        <PopoverComponent
          content={popOverContent("Download Apps")}
          trigger={popOverModalTrigger(<LiaDownloadSolid />)}
        /> */}
      </Flex>
      <AppsModal
        show={openAppModal}
        close={closeAppModal}
        opened={isAppModalOpened}
      />
      <AddServerModal
        show={openServerModal}
        close={closeServerModal}
        opened={isServerModalOpened}
      />
    </>
  );
});

export default ServerList;
