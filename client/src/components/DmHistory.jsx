import React, { useEffect } from "react";
import PopoverComponent from "./PopoverComponent";
import { IoAdd } from "react-icons/io5";

import UsersInDmHistory from "./UsersInDmHistory";
import { socket } from "../socket";
import "../css/friends.css";
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
          <PopoverComponent
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
