import React from "react";
import { socket } from "../socket";
import Popover from "./Popover";
import { memo } from "react";

const Options = memo(function Options({ styles, options, msg }) {
  return (
    <>
      {options().map((option, i) => {
        if (option.name == "Delete" || option.name == "Edit") {
          if (socket.auth.userId !== msg.from_id) {
            return;
          }
        }
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
