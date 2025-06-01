import React from "react";
import { Outlet } from "react-router-dom";
import "../css/friends.css";

const FriendsPanelList = () => {
  return (
    <>
      <div className="text-white fs-5">Friends panel</div>
      <Outlet />
    </>
  );
};

export default FriendsPanelList;
