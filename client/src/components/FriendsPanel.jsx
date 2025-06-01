import React from "react";
import { Outlet } from "react-router-dom";

const FriendsPanel = () => {
  return (
    <>
      <div className="d-flex w-100">
        <Outlet />
      </div>
    </>
  );
};

export default FriendsPanel;
