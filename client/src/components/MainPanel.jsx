import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../css/main_panel.css";
import Sidebar from "./Sidebar";
import { CachedContext } from "../contexts/CacheContext";

const MainPanel = () => {
  const location = useLocation();
  const [path, setPath] = useState(location.pathname);
  const [cachedChat, setCachedChat] = useState(new Map());
  const [cachedReceiver, setCachedReceiver] = useState(new Map());
  const cachedValue = {
    cachedChat,
    setCachedChat,
    cachedReceiver,
    setCachedReceiver,
  };

  return (
    <>
      <div id="mainPanel" className="d-flex w-100">
        <Sidebar path={path} />
        <CachedContext value={cachedValue}>
          <div className="d-flex flex-column border border-white border-opacity-25 border-start-0 border-end-0 w-100">
            <Outlet />
          </div>
        </CachedContext>
      </div>
    </>
  );
};

export default MainPanel;
