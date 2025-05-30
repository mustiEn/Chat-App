import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../css/main_panel.css";
import Sidebar from "./Sidebar";

const MainPanel = () => {
  const location = useLocation();
  const [path, setPath] = useState(location.pathname);

  useEffect(() => {
    setPath(location.pathname);
  }, [location.pathname]);
  console.log(location.pathname);

  return (
    <>
      <div
        id="mainPanel"
        className="d-flex border border-start w-100"
        style={{ height: "100vh" }}
      >
        <Sidebar path={path} />
        <Outlet />
      </div>
    </>
  );
};

export default MainPanel;
