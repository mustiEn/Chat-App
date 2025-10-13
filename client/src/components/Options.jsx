import React, { useCallback } from "react";
import { socket } from "../socket";
import Popover from "./Popover";
import { memo } from "react";
import styles from "../css/dm_panel.module.css";
import { PiPencilSimple, PiArrowBendUpLeft } from "react-icons/pi";
import { ImBin } from "react-icons/im";
import { RxDrawingPin } from "react-icons/rx";
import { useOutletContext } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

import Tooltip from "react-bootstrap/Tooltip";

const Options = memo(function Options({ msg = [], handleDmModalNotifier }) {
  const { setDmChat } = useOutletContext();

  const handleEditableMsg = (msg) => {
    setEditedMessage({
      id: msg.id,
      message: msg.message,
    });
    setTimeout(() => {
      console.log(msg, document.querySelector(`#message-${msg.id}`));

      document.querySelector(`#message-${msg.id} textarea`).focus();
      console.log("focus");
    }, 100);
  };
  const options = useCallback(
    () => [
      {
        name: "Edit",
        icon: <PiPencilSimple />,
        func: handleEditableMsg,
      },
      {
        name: "Reply",
        icon: <PiArrowBendUpLeft />,
        func: (msg) =>
          setDmChat((prev) => ({
            ...prev,
            msgToReply: msg,
          })),
      },
      {
        name: "Delete",
        icon: <ImBin />,
        func: (msg) => handleDmModalNotifier(msg, "Delete"),
      },
      {
        name: "Pin",
        icon: <RxDrawingPin />,
        func: (msg) => handleDmModalNotifier(msg, "Pin"),
      },
    ],
    []
  );
  const isUserIdIsEqualToFromId = (optionName) => {
    if (optionName == "Delete" && socket.auth.user?.id !== msg.from_id) {
      return true;
    } else if (optionName == "Edit" && socket.auth.user?.id !== msg.from_id) {
      return true;
    }
  };
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Simple tooltip
    </Tooltip>
  );
  return (
    <>
      {options().map((option, i) => {
        if (isUserIdIsEqualToFromId(option.name)) return;
        return (
          <Popover
            key={i}
            content={
              <div className="fw-bold popover-content">{option.name}</div>
            }
            trigger={
              <div
                id={option.name + "-" + msg.id}
                className={`${styles["option"]} d-flex align-items-center justify-content-center p-1 rounded-3`}
                onClick={() => option.func(msg)}
              >
                {option.icon}
              </div>
            }
            placement="top"
          />
          // <OverlayTrigger
          //   key={i}
          //   trigger={["hover", "focus"]}
          //   placement={"top"}
          //   overlay={renderTooltip}
          //   container={document.getElementById("root")}

          //   // delay={{ show: 100, hide: 100 }}
          // >
          //   <div
          //     id={option.name + "-" + msg.id}
          //     className={`${styles["option"]} d-flex align-items-center justify-content-center p-1 rounded-3`}
          //     onClick={() => option.func(msg)}
          //   >
          //     {option.icon}
          //   </div>
          // </OverlayTrigger>
        );
      })}
    </>
  );
});

export default Options;
