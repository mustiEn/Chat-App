import React from "react";
import { NavLink, useLoaderData } from "react-router-dom";
import { TbActivity } from "react-icons/tb";
import { IoAddCircleSharp } from "react-icons/io5";
import { LiaDownloadSolid } from "react-icons/lia";
import Button from "react-bootstrap/Button";
import Popover from "./Popover";
import "../css/server_list.css";

const ServerList = ({ updateHeader }) => {
  // const servers = useLoaderData();
  // const servers = Array.from({length:5})
  const concatFirstLetters = (name) => {
    const splitName = name.split(" ");
    const result = splitName.reduce((acc, curr) => {
      acc += curr[0];
      return acc;
    }, "");

    return result;
  };
  const popOverContent = (content = {}) => {
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
  const popOverTrigger = (server = null, icon = null) => {
    return (
      <Button
        variant={"dark"}
        className={"d-flex justify-content-center align-items-center mx-1 p-0"}
        style={{ width: 40, height: 35, fontSize: 20 }}
        as={NavLink}
        to={`/t`}
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
  return (
    <>
      <div id="serverList" className="d-flex flex-column gap-2 px-2">
        <Popover
          content={popOverContent("Direct Messages")}
          trigger={popOverTrigger(undefined, <TbActivity />)}
          updateHeader={updateHeader}
        />
        {Array.from({ length: 5 }, (_, server) => (
          <Popover
            key={server}
            content={popOverContent(server + 1)}
            trigger={popOverTrigger(server + 1)}
            updateHeader={updateHeader}
          />
        ))}
        <Popover
          content={popOverContent("Add a server")}
          trigger={popOverTrigger(undefined, <IoAddCircleSharp />)}
          updateHeader={updateHeader}
        />
        <Popover
          content={popOverContent("Download Apps")}
          trigger={popOverTrigger(undefined, <LiaDownloadSolid />)}
          updateHeader={updateHeader}
        />
      </div>
    </>
  );
};

export default ServerList;
