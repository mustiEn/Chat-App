import React, { useEffect } from "react";
import Popover from "./Popover";
import { IoAdd } from "react-icons/io5";
import Button from "react-bootstrap/esm/Button";
import { NavLink, useNavigate } from "react-router-dom";
import DmHistorySkeleton from "./DmHistorySkeleton";
import "../css/friends.css";

const DmHistory = () => {
  const navigate = useNavigate();
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

  //! bak
  // useEffect(() => {
  //   navigate("/@me/3");
  // }, []);
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
          {Array.from({ length: 4 }, (_, i) => (
            <li
              key={i}
              // className="position-relative"
              style={{ width: "100%", height: 45 }}
            >
              <Button
                variant={"dark"}
                as={NavLink}
                to={`/@me/${i}`}
                className={"position-relative w-100 h-100"}
              >
                <div
                  className="position-absolute w-100 h-100 top-0 start-0 z-0"
                  style={{
                    // backgroundImage: "url(/atomic.gif)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "100% 30%",
                    maskImage:
                      "linear-gradient(to left, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0))",
                    WebkitMaskImage:
                      "linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0))",
                  }}
                ></div>
                <div className="d-flex align-items-center gap-3 position-absolute z-1">
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
          {/* <DmHistorySkeleton /> */}
        </ul>
      </div>
    </>
  );
};

export default DmHistory;
