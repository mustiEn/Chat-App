import React from "react";
import DmSidebarNavTop from "./DmSidebarNavTop";
import DmHistory from "./DmHistory";
import { useEffect } from "react";

const DmSidebarNav = () => {
  return (
    <>
      <DmSidebarNavTop />
      <DmHistory />
    </>
  );
};

export default DmSidebarNav;
