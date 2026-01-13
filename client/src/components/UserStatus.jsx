import { Box } from "@mantine/core";
import React from "react";

const UserStatus = ({ status, w, h, absolute }) => {
  return (
    <div
      className="user-status"
      style={{
        position: absolute ? "absolute" : "unset",
        right: absolute ? -2 : 0,
        bottom: absolute ? -2 : 0,
        backgroundColor:
          status === "Online" ? "green" : status === "Idle" ? "yellow" : "gray",
        border: "1px solid #2c2c30",
        borderRadius: "100%",
        width: w,
        height: h,
      }}
    ></div>
  );
};

export default UserStatus;
