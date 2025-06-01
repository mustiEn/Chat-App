import React from "react";
import Button from "react-bootstrap/esm/Button";
import { FaUsers } from "react-icons/fa6";
import { LuDot } from "react-icons/lu";
import { NavLink } from "react-router-dom";

const FriendsPanelTop = () => {
  return (
    <>
      <div
        className="d-flex align-items-center gap-2 px-2 w-100 border-bottom border-opacity-25 border-white text-white"
        style={{ height: 50 }}
      >
        <div className="d-flex align-items-center gap-2">
          <FaUsers />
          <div>Friends</div>
        </div>
        <LuDot />
        <Button variant="dark" size="sm" as={NavLink} to={"/@me"} end>
          Online
        </Button>
        <Button variant="dark" size="sm" as={NavLink} to={"/@me/all"}>
          All
        </Button>
        <Button
          variant="outline-dark"
          size="sm"
          as={NavLink}
          to={"/@me/add-friend"}
        >
          Add friend
        </Button>
      </div>
    </>
  );
};

export default FriendsPanelTop;
