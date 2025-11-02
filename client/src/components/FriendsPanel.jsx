import React, { useState } from "react";
import FriendsPanelTop from "./FriendsPanelTop";

import { Flex } from "@mantine/core";
import { Outlet, useOutletContext } from "react-router-dom";

const FriendsPanel = () => {
  const outletContext = useOutletContext();
  const [activeComp, setActiveComp] = useState(0);

  return (
    <>
      <Flex color="white" direction={"column"} h={"100%"}>
        <FriendsPanelTop props={[setActiveComp, activeComp]} />
        <Outlet context={outletContext} />
      </Flex>
    </>
  );
};

export default FriendsPanel;
