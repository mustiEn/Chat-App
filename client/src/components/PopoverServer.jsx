import React from "react";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { Link, NavLink } from "react-router-dom";

const PopoverServer = ({ server, classname, updateHeader }) => {
  const popover = (
    <Popover id="popover-basic" className="bg-dark">
      <Popover.Body
        style={{ height: 30 }}
        className="d-flex align-items-center"
      >
        <div className="d-flex flex-column">
          <div style={{ fontSize: 13, color: "#bdbbbb" }} className="fw-bold">
            Jack daniels
          </div>
          {server?.is_muted && (
            <span className="text-pale" style={{ fontSize: "10px" }}>
              {server.is_muted}
            </span>
          )}
        </div>
      </Popover.Body>
    </Popover>
  );
  const concatFirstLetters = (name) => {
    const splitName = name.split(" ");
    const result = splitName.reduce((acc, curr) => {
      acc += curr[0];
      return acc;
    }, "");

    return result;
  };

  return (
    <OverlayTrigger
      trigger={["hover", "focus"]}
      placement="right"
      overlay={popover}
    >
      <Button
        variant={"dark"}
        as={NavLink}
        to={`/s`}
        className={classname}
        style={{ width: 40, height: 35, fontSize: 20 }}
        onClick={() => updateHeader(Math.floor(Math.random() * 100))}
      >
        {server?.image ? (
          <img
            src={server?.image}
            alt={server?.name}
            style={{ width: "30px", height: "30px", borderRadius: "50%" }}
          />
        ) : (
          concatFirstLetters("Jack daniels")
        )}
      </Button>
    </OverlayTrigger>
  );
};

export default PopoverServer;
