import React, { useState } from "react";
import FriendsPanelTop from "./FriendsPanelTop";
import OnlineFriends from "./OnlineFriends";
import AllFriends from "./AllFriends";
import AddFriend from "./AddFriend";
import { Box, Flex, Text, Title } from "@mantine/core";
import { Outlet } from "react-router-dom";

const FriendsPanel = () => {
  const [activeComp, setActiveComp] = useState(0);
  // const renderComponent = [<OnlineFriends />, <AllFriends />, <AddFriend />];

  return (
    <>
      <Flex color="white" direction={"column"} h={"100%"}>
        <FriendsPanelTop props={[setActiveComp, activeComp]} />
        <Outlet />
        {/* {renderComponent[activeComp]} */}
      </Flex>
    </>
  );
};

export default FriendsPanel;
