import { Box } from "@mantine/core";
import React from "react";

const UserStatus = ({ status, w, h, absolute }) => {
  return (
    <Box
      className={`user-status`}
      pos={absolute ? "absolute" : "unset"}
      right={absolute ? -2 : 0}
      bottom={absolute ? -2 : 0}
      bg={status === "Online" ? "green" : status === "Idle" ? "yellow" : "gray"}
      bd={"1px solid #2c2c30"}
      bdrs={"100%"}
      w={w}
      h={h}
    ></Box>
  );
};

export default UserStatus;
