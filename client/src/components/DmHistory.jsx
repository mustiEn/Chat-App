import React, { useEffect } from "react";
import Popover from "./Popover";
import { IoAdd } from "react-icons/io5";
import Button from "react-bootstrap/esm/Button";
import { NavLink, useNavigate } from "react-router-dom";
import DmHistorySkeleton from "./DmHistorySkeleton";
import "../css/friends.css";
import UsersInDmHistory from "./UsersInDmHistory";
import { socket } from "../socket";

const DmHistory = () => {
  const popOverContent = (content) => {
    return (
      <div className="d-flex flex-column">
        <div className="fw-bold popover-content">{content}</div>
      </div>
    );
  };
  const popOverTrigger = (icon) => {
    return <div>{icon}</div>;
  };

  return (
    <>
      <div className="px-2 w-100">
        <div className="d-flex justify-content-between mb-1 text-white">
          <div>Direct Messages</div>
          <Popover
            trigger={popOverTrigger(<IoAdd />)}
            content={popOverContent("Create DM")}
          />
        </div>
        <UsersInDmHistory />
        <button
          onClick={() => {
            socket.disconnect();
          }}
        >
          close
        </button>
        <button onClick={() => socket.connect()}>connect</button>
      </div>
    </>
  );
};

export default DmHistory;
