import React from "react";
import Popover from "./Popover";
import { IoAdd } from "react-icons/io5";
import Button from "react-bootstrap/esm/Button";
import { NavLink } from "react-router-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
  const box = ({ children }) => {
    return (
      <div
        style={{
          border: "1px solid black",
          width: "50%",
          height: "50px",
          display: "block",
        }}
      >
        {children}
      </div>
    );
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
          {/* {Array.from({ length: 3 }, (_, i) => (
            <li key={i}>
              <Button
                variant={"dark"}
                as={NavLink}
                to={`/@mef`}
                className={i == 0 ? "active w-100" : "w-100"}
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
          
          ))} */}
          <div>
            <SkeletonTheme
              baseColor="#212020e3"
              enableAnimation={false}
              height={20}
              borderRadius={20}
            >
              <div className="d-flex flex-column gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <div className="d-flex align-items-center gap-2">
                    <Skeleton circle width={32} height={32} />
                    <div
                      style={{
                        width: "150px",
                        display: "block",
                      }}
                    >
                      <Skeleton />
                    </div>
                  </div>
                ))}
              </div>
            </SkeletonTheme>
          </div>
        </ul>
      </div>
    </>
  );
};

export default DmHistory;
