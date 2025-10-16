import React from "react";
import DmSidebarNavTop from "./DmSidebarNavTop";
import DmHistory from "./DmHistory";
import { useEffect } from "react";

const DmSidebarNav = () => {
  // console.log("DM SIDEBAR NAV");
  useEffect(() => {
    console.log("DM Sidebar Nav");
  }, []);
  return (
    <>
      <DmSidebarNavTop />
      <DmHistory />
    </>
  );
};

export default DmSidebarNav;
