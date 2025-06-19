import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../css/main_panel.css";
import Sidebar from "./Sidebar";

const MainPanel = () => {
  const location = useLocation();
  const [path, setPath] = useState(location.pathname);

  return (
    <>
      <div id="mainPanel" className="d-flex w-100">
        <Sidebar path={path} />
        <div className="d-flex flex-column border border-white border-opacity-25 border-start-0 border-end-0 w-100">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default MainPanel;
