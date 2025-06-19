import React, { useContext } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import BootstrapPopover from "react-bootstrap/Popover";
import HeaderContext from "../contexts/HeaderContext";

const Popover = ({ content, trigger }) => {
  const popover = (
    <BootstrapPopover id="popover-basic" className="bg-dark">
      <BootstrapPopover.Body
        style={{ height: 30 }}
        className="d-flex align-items-center"
      >
        {content}
      </BootstrapPopover.Body>
    </BootstrapPopover>
  );

  return (
    <OverlayTrigger
      trigger={["hover", "focus"]}
      placement="right"
      overlay={popover}
      container={document.getElementById("root")}
      // delay={{ show: 100, hide: 100 }}
    >
      {trigger}
    </OverlayTrigger>
  );
};

export default Popover;
