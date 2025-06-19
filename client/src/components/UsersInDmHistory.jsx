import React, { useContext, useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import { NavLink } from "react-router-dom";
import HeaderContext from "../contexts/HeaderContext";
// import DmHistorySkeleton from './DmHistorySkeleton'

const UsersInDmHistory = ({ arr }) => {
  const setHeader = useContext(HeaderContext);
  const setDmHistorySessionStorage = (id) => {
    sessionStorage.setItem("userId", id);
  };
  // useEffect(() => {
  //   if (sessionStorage.getItem("userId")) {
  //     const userId = sessionStorage.getItem("userId");
  //     navigate(`dm/${userId}`);
  //   }
  // }, []);
  return (
    <>
      <ul className="d-flex flex-column gap-1">
        {arr.map((i) => (
          <li
            key={i}
            // className="position-relative"
            style={{ width: "100%", height: 45 }}
            onClick={() => setHeader(i)}
          >
            <Button
              variant={"dark"}
              as={NavLink}
              to={`${i}`}
              className={"position-relative w-100 h-100"}
              onClick={() => setDmHistorySessionStorage(i)}
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
    </>
  );
};

export default UsersInDmHistory;
