import React from "react";
import { Outlet } from "react-router-dom";
import "../css/main_panel.css";
import Sidebar from "./Sidebar";

const MainPanel = () => {
  return (
    <>
      <div
        id="mainPanel"
        className="d-flex border border-start w-100"
        style={{ height: "100vh" }}
      >
        <Sidebar />
        <Outlet />
      </div>
    </>
  );
};

export default MainPanel;
