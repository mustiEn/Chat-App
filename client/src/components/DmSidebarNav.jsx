import React from "react";
import SidebarNavTop from "./SidebarNavTop";
import DmHistory from "./DmHistory";

const DmSidebarNav = () => {
  console.log("DM SIDEBAR NAV");

  return (
    <>
      <div className="fs-3 text-white">DM SIDEBAR NAV</div>
      <SidebarNavTop />
      <DmHistory />
    </>
  );
};

export default DmSidebarNav;
