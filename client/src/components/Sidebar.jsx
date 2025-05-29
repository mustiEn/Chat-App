import React from "react";
import { Outlet } from "react-router-dom";

const Sidebar = () => {
  return (
    <>
      <div
        id="sidebar"
        className="text-white align-items-center border border-end-0 d-flex flex-column rounded-start-4"
        style={{ backgroundColor: "#121214", width: 400 }}
      >
        SIDEBAR1
        <Outlet />
      </div>
    </>
  );
};

export default Sidebar;
