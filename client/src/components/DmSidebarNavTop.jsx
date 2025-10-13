import React, { useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import { FaUsers } from "react-icons/fa6";
import { IoMdStarOutline } from "react-icons/io";
import { AiOutlineShop } from "react-icons/ai";
import { NavLink } from "react-router-dom";
import HeaderContext from "../contexts/HeaderContext";

const links = [
  { content: "Friends", icon: <FaUsers />, link: "/@me" },
  { content: "Bots", icon: <IoMdStarOutline />, link: "bots" },
  { content: "Shop", icon: <AiOutlineShop />, link: "shop" },
  { content: "Requests", icon: <AiOutlineShop />, link: "requests" },
];

const DmSidebarNavTop = () => {
  const setHeader = useContext(HeaderContext);

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
                to={link.link}
                className="d-flex w-100"
                onClick={() => setHeader(link.content)}
                end
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

export default DmSidebarNavTop;
