import React from "react";
import styles from "../css/friend_profile.module.css";
import Badge from "react-bootstrap/esm/Badge";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import { Link } from "react-router-dom";

const FriendProfile = () => {
  return (
    <>
      <div
        id={styles["friend-profile"]}
        className="d-flex flex-column position-relative text-white h-100 ms-auto"
      >
        <div className={`${styles["friend-profile-bg"]} bg-dark w-100`}></div>
        <div
          className="flex-grow-1 position-relative z-1 px-2"
          // style={{
          //   backgroundColor: "transparent",
          // }}
          style={{
            backgroundColor: "rgb(25, 25, 25)",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              transform: "translateY(-55%)",
            }}
            className="position-relative z-1"
          >
            <img src={"https://placehold.co/80"} className="rounded-circle" />
            <Badge
              bg="success"
              className="position-absolute translate-middle rounded-circle"
              style={{
                left: "85%",
                top: "90%",
              }}
            >
              &nbsp;
            </Badge>
          </div>
          <div className="fw-bold fs-5">Dev2Github</div>
          <p>dev2github_43534</p>
          <div className="bg-dark border-dark rounded-2 p-2">
            <div className="d-flex flex-column">
              <p className="fw-bold" style={{ fontSize: 12 }}>
                Member Since
              </p>
              <div>24 May 2025</div>
            </div>
          </div>
          <DropdownButton
            id="dropdown-basic-button"
            title="Dropdown button"
            variant="dark"
            className="mt-2"
          >
            <Dropdown.Item as={Link}>Action</Dropdown.Item>
            <Dropdown.Item as={Link}>Another action</Dropdown.Item>
            <Dropdown.Item as={Link}>Something else</Dropdown.Item>
          </DropdownButton>
        </div>
        <div
          className={`${styles["product-bg"]} position-absolute z-0 top-0 w-100 h-100`}
          // style={{
          //   backgroundImage:
          //     "linear-gradient(to bottom, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.77)),url(/kaneki-2.gif)",
          //   backgroundSize: "100% 110%",
          //   backgroundRepeat: "no-repeat",
          //   opacity: 0.7,
          // }}
        ></div>
      </div>
    </>
  );
};

export default FriendProfile;
