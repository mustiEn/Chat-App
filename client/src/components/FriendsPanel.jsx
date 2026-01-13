import React, { useEffect, useState } from "react";
import FriendsPanelTop from "./FriendsPanelTop";
import { Flex } from "@mantine/core";
import { Outlet, useOutletContext } from "react-router-dom";
import { useHeaderStore } from "../stores/useHeaderStore";

const FriendsPanel = () => {
  const outletContext = useOutletContext();
  const [activeComp, setActiveComp] = useState(0);
  const setHeader = useHeaderStore((s) => s.setHeader);

  useEffect(() => {
    setHeader("Friends");
  }, []);

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
