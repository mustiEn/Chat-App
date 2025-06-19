import React, { useContext, useState } from "react";
import { NavLink, useLoaderData, useLocation } from "react-router-dom";
import { TbActivity } from "react-icons/tb";
import { IoAddCircleSharp } from "react-icons/io5";
import { LiaDownloadSolid } from "react-icons/lia";
import Button from "react-bootstrap/Button";
import Popover from "./Popover";
import "../css/server_list.css";
import AppsModal from "./AppsModal";
import AddServerModal from "./AddServerModal";
import HeaderContext from "../contexts/HeaderContext";

const ServerList = () => {
  // const servers = useLoaderData();
  // const servers = Array.from({length:5})
  const setHeader = useContext(HeaderContext);
  const [showAppsModal, setShowAppsModal] = useState(false);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
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
        <div style={{ fontSize: 13, color: "#bdbbbb" }} className="fw-bold">
          {typeof content == "number" ? "Jack daniels" : content}
        </div>
        {content && content?.is_muted && (
          <span className="text-pale" style={{ fontSize: "10px" }}>
            {content.is_muted}
          </span>
        )}
      </div>
    );
  };
  const popOverTrigger = (link, server = null, icon = null, content) => {
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
  const popOverModalTrigger = (icon) => {
    return (
      <Button
        variant={"dark"}
        className={"d-flex justify-content-center align-items-center mx-1 p-0"}
        style={{ width: 40, height: 35, fontSize: 20 }}
        onClick={() => setShowAppsModal(true)}
      >
        {icon}
      </Button>
    );
  };
  return (
    <>
      <div id="serverList" className="d-flex flex-column gap-2 px-2">
        <Popover
          content={popOverContent("Direct Messages")}
          trigger={popOverTrigger("/@me", undefined, <TbActivity />, "Friends")}
        />
        {Array.from({ length: 5 }, (_, server) => (
          <Popover
            key={server}
            content={popOverContent(server + 1)}
            trigger={popOverTrigger(
              "/group-chat",
              server + 1,
              undefined,
              "Jack Daniels"
            )}
          />
        ))}
        <Popover
          content={popOverContent("Add a server")}
          trigger={popOverModalTrigger(<IoAddCircleSharp />)}
        />
        <Popover
          content={popOverContent("Download Apps")}
          trigger={popOverModalTrigger(<LiaDownloadSolid />)}
        />
      </div>
      <AppsModal show={showAppsModal} onHide={() => setShowAppsModal(false)} />
      <AddServerModal
        show={showAddServerModal}
        onHide={() => setShowAddServerModal(false)}
      />
    </>
  );
};

export default ServerList;
