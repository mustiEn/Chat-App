import React, { useCallback } from "react";
import { socket } from "../socket";
import PopoverComponent from "./PopoverComponent.jsx";
import { memo } from "react";
import { PiPencilSimple, PiArrowBendUpLeft } from "react-icons/pi";
import { ImBin } from "react-icons/im";
import { RxDrawingPin } from "react-icons/rx";
import { useMsgToReplyStore } from "../stores/useMsgToReplyStore.js";
import styles from "../css/dm_panel.module.css";
import { useContext } from "react";
import { DmPanelContext } from "../contexts/DmPanelContext.jsx";

const Options = ({
  msg,
  handleEditableMsg,
}) => {
  const setMsgToReply = useMsgToReplyStore((state) => state.setMsgToReply);
  const {activeMsg,setActiveMsg,open} = useContext(DmPanelContext)
  const handleDmModalNotifier = (msg,type) => {
    setActiveMsg({msg,type})
    open()
  }

  
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
        func: (msg) => setMsgToReply(msg),
      },
      {
        name: "Delete",
        icon: <ImBin />,
        func: (msg) => handleDmModalNotifier(msg, "Delete"),
      },
      {
        name: msg.is_pinned ? "Unpin" : "Pin",
        icon: <RxDrawingPin />,
        func: function (msg) {
          handleDmModalNotifier(msg, this.name);
        },
      },
    ],
    [activeMsg]
  );
  const isUserIdIsEqualToFromId = (optionName) => {
    if (optionName == "Delete" && socket.auth.user?.id !== msg.from_id) {
      return true;
    } else if (optionName == "Edit" && socket.auth.user?.id !== msg.from_id) {
      return true;
    }
  };

  return (
    <>
      {options().map((option, i) => {
        if (isUserIdIsEqualToFromId(option.name)) return;
        return (
          <PopoverComponent
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
            position="top"
          />
        );
      })}
    </>
  );
};

export default Options;
