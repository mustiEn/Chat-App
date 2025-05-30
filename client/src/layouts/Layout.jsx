import ServerList from "../components/ServerList";
import MainPanel from "../components/MainPanel";
import Header from "../components/Header";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [headerContent, setHeaderContent] = useState("Hello");
  const updateHeader = (newContent) => {
    setHeaderContent(newContent);
  };
  return (
    <>
      <Header content={headerContent} />
      <div
        id="responiveContainer"
        style={{ minHeight: 100 + "vh" }}
        className="d-flex w-100"
      >
        <ServerList updateHeader={updateHeader} />
        {/* <Sidebar /> */}
        {/* <MainPanel /> */}
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
