import { Box } from "@mantine/core";
import React from "react";

const UserStatus = ({ status, w, h }) => {
  return (
    <Box
      className={`user-status`}
      bg={status === "Online" ? "green" : status === "Idle" ? "yellow" : "gray"}
      w={w}
      h={h}
    ></Box>
  );
};

export default UserStatus;
