import React from "react";
import { memo } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import BootstrapPopover from "react-bootstrap/Popover";

const Popover = ({ content, trigger, placement = "right" }) => {
  const popover = (
    <BootstrapPopover
      id="popover-basic"
      // className="bg-dark"
      data-bs-theme="dark"
    >
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
      placement={placement}
      overlay={popover}
      container={document.getElementById("root")}

      // delay={{ show: 100, hide: 100 }}
    >
      {trigger}
    </OverlayTrigger>
  );
};

export default Popover;
