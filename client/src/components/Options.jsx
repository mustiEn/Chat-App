import React from "react";
import { socket } from "../socket";
import Popover from "./Popover";
import { memo } from "react";
import styles from "../css/dm_panel.module.css";

const Options = memo(function Options({ options, msg }) {
  const isUserIdIsEqualToFromId = (optionName) => {
    if (optionName == "Delete" && socket.auth.userId !== msg.from_id) {
      return true;
    } else if (optionName == "Edit" && socket.auth.userId !== msg.from_id) {
      return true;
    }
  };
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
        );
      })}
    </>
  );
});

export default Options;
