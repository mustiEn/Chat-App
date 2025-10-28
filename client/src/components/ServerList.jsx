import React, { memo, useContext, useMemo, useState } from "react";
import { NavLink, useLoaderData, useLocation } from "react-router-dom";
import { TbActivity } from "react-icons/tb";
import { IoAddCircleSharp } from "react-icons/io5";
import { LiaDownloadSolid } from "react-icons/lia";
import Button from "react-bootstrap/Button";
import PopoverComponent from "./PopoverComponent";
import "../css/server_list.css";
import AppsModal from "./AppsModal";
import AddServerModal from "./AddServerModal";
import HeaderContext from "../contexts/HeaderContext";
import { Flex } from "@mantine/core";
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
      <div className="d-flex flex-column">
        <div className="fw-bold popover-content">
          {typeof content == "number" ? "Jack daniels" : content}
        </div>
        {content && content?.is_muted && (
          <span className="text-muted" style={{ fontSize: "10px" }}>
            {content.is_muted}
          </span>
        )}
      </div>
    );
  };
  const popOverTrigger = (link, server = null, icon = null) => {
    return (
      <Button
        variant={"dark"}
        className={"d-flex justify-content-center align-items-center mx-1 p-0"}
        style={{ width: 40, height: 35, fontSize: 20 }}
        // onClick={() => setHeader(content)}
        as={NavLink}
        to={link}
      >
        {server ? (
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
        )}
      </Button>
    );
  };
  const popOverModalTrigger = (icon, toggler) => {
    return (
      <Button
        variant={"dark"}
        className={"d-flex justify-content-center align-items-center mx-1 p-0"}
        style={{ width: 40, height: 35, fontSize: 20 }}
        onClick={toggler}
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
        mr={"auto"}
        ps={"xs"}
        pl={"xs"}
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
