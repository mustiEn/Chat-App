import React, { useState } from "react";
import FriendsPanelTop from "./FriendsPanelTop";
import OnlineFriends from "./OnlineFriends";
import AllFriends from "./AllFriends";
import AddFriend from "./AddFriend";
import { Box, Text, Title } from "@mantine/core";

const FriendsPanel = () => {
  const [activeComp, setActiveComp] = useState(0);
  const renderComponent = () => {
    let comp;
    if (activeComp == 0) {
      comp = <OnlineFriends />;
    } else if (activeComp == 1) {
      comp = <AllFriends />;
    } else {
      comp = <AddFriend />;
    }
    return comp;
  };

  return (
    <>
      <Box color="white">
        <FriendsPanelTop props={[setActiveComp, activeComp]} />

        <Text fz={"h1"} mb={"md"}>
          FriendsPanel
        </Text>
        {renderComponent()}
      </Box>
    </>
  );
};

export default FriendsPanel;
