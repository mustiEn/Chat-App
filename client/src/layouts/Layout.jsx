import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./layout.css";
import Sidebar from "../components/Sidebar";
import ChatView from "../components/ChatView";
import DynamicPanel from "../components/DynamicPanel";
// import { ChatProvider } from "../context_providers/SocketContext";

const Layout = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="main-board d-flex rounded-4">
            <Sidebar />
            <div
              id="contentArea"
              className="position-relative rounded-start-4 d-flex"
            >
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
