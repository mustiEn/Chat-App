import React from "react";
import Button from "react-bootstrap/esm/Button";
import { FaUsers } from "react-icons/fa6";
import { LuDot } from "react-icons/lu";

const btns = [
  { name: "Online", variant: "dark" },
  { name: "All", variant: "dark" },
  { name: "Add friend", variant: "outline-light" },
];

const FriendsPanelTop = ({ props }) => {
  const [activeCompSetter, activeComp] = props;

  return (
    <>
      <div
        className="d-flex align-items-center gap-2 px-2 w-100 text-white mt-2 mb-2"
        style={{ height: 34 }}
      >
        <div className="d-flex align-items-center gap-2">
          <FaUsers className="fs-5" />
          <div className="fs-6">Friends</div>
        </div>
        <LuDot />
        {btns.map((btn, i) => (
          <Button
            key={i}
            variant={btn.variant}
            size="sm"
            className={activeComp == i ? "active" : ""}
            onClick={() => activeCompSetter(i)}
          >
            {btn.name}
          </Button>
        ))}
      </div>
      <div className="border-bottom border-opacity-25 border-white w-100"></div>
    </>
  );
};

export default FriendsPanelTop;
