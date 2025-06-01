import React from "react";
import DmSidebarNavTop from "./DmSidebarNavTop";
import DmHistory from "./DmHistory";

const DmSidebarNav = () => {
  // console.log("DM SIDEBAR NAV");

  return (
    <>
      <div className="fs-3 text-white">DM SIDEBAR NAV</div>
      <DmSidebarNavTop />
      <DmHistory />
    </>
  );
};

export default DmSidebarNav;
