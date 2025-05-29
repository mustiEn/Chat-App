import React from "react";
import Popover from "./Popover";
import { IoAdd } from "react-icons/io5";
import Button from "react-bootstrap/esm/Button";
import { NavLink } from "react-router-dom";

const DmHistory = () => {
  const popOverContent = (content) => {
    return (
      <div className="d-flex flex-column">
        <div style={{ fontSize: 13, color: "#bdbbbb" }} className="fw-bold">
          {content}
        </div>
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
        <ul className="d-flex flex-column gap-1">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index}>
              <Button
                variant={"dark"}
                as={NavLink}
                to={`/dm`}
                className="w-100"
              >
                <div className="d-flex align-items-center gap-3">
                  <img
                    src="https://placehold.co/32"
                    className="rounded-circle"
                    alt=""
                  />
                  <div>Hack Daniels</div>
                </div>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default DmHistory;
