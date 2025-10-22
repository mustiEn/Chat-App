import React, { useState } from "react";
import FriendsPanelTop from "./FriendsPanelTop";
import OnlineFriends from "./OnlineFriends";
import AllFriends from "./AllFriends";
import AddFriend from "./AddFriend";

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
      <div className="fs-2 text-white">
        <FriendsPanelTop props={[setActiveComp, activeComp]} />
        FriendsPanel
        {renderComponent()}
      </div>
    </>
  );
};

export default FriendsPanel;
