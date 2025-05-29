import React from "react";
import Button from "react-bootstrap/esm/Button";
import { FaUsers } from "react-icons/fa6";
import { IoMdStarOutline } from "react-icons/io";
import { NavLink } from "react-router-dom";

const SidebarNavTop = () => {
  const links = [
    { content: "Friends", icon: <FaUsers /> },
    { content: "Bots", icon: <IoMdStarOutline /> },
  ];
  return (
    <>
      <div className="mt-2 w-100">
        <div className="d-flex justify-content-center border-bottom border-opacity-25 border-white">
          <Button variant={"dark"} className="mb-1 mx-2 w-100">
            Find or start a conversation
          </Button>
        </div>
        <ul className="d-flex flex-column gap-1 mt-3 mx-2">
          {links.map((link, i) => (
            <li key={i}>
              <Button
                variant={"dark"}
                key={i}
                as={NavLink}
                to={"/z"}
                className="d-flex w-100"
              >
                <div>{link.icon}</div>
                <div>{link.content}</div>
              </Button>
            </li>
          ))}
        </ul>
        <hr className="text-white mx-2" />
      </div>
    </>
  );
};

export default SidebarNavTop;
