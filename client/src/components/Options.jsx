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
import { Flex, Text } from "@mantine/core";

const Options = ({ msg, handleEditableMsg }) => {
  const setMsgToReply = useMsgToReplyStore((state) => state.setMsgToReply);
  const { activeMsg, setActiveMsg, open } = useContext(DmPanelContext);
  const handleDmModalNotifier = (msg, type) => {
    setActiveMsg({ msg, type });
    open();
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
              <Text fw={"bold"} className="popover-content">
                {option.name}
              </Text>
            }
            trigger={
              <Flex
                id={option.name + "-" + msg.id}
                align={"center"}
                justify={"center"}
                p={5}
                className={`${styles["option"]}`}
                onClick={() => option.func(msg)}
                style={{
                  borderRadius: 10,
                }}
              >
                {option.icon}
              </Flex>
            }
            position="top"
          />
        );
      })}
    </>
  );
};

export default Options;
