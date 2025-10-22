import React, { useCallback, useState } from "react";
import Options from "./Options.jsx";
("../contexts/DmContext.jsx");
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import styles from "../css/dm_panel.module.css";
import DmItemInner from "./DmItemInner.jsx";
import { useEffect } from "react";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const DmItem = ({ msg }) => {
  const [editedMessage, setEditedMessage] = useState({ id: null, message: "" });
  const handleEditableMsg = (msg) => {
    setEditedMessage({
      id: msg.id,
      message: msg.message,
    });
    setTimeout(() => {
      document.querySelector(`#message-${msg.id} textarea`).focus();
    }, 100);
  };

  return (
    <>
      <div
        id={`message-${msg?.id}`}
        className={`${styles["message"]} rounded-2 p-1 w-100 position-relative`}
        // style={{
        //   position: "absolute",
        //   width: "100%",
        //   top: 0,
        //   left: 0,
        //   height: `${virtualRow.size}px`,
        //   transform: `translateY(${virtualRow.start}px)`,
        // }}
      >
        <DmItemInner
          msg={msg}
          editedMessage={editedMessage}
          setEditedMessage={setEditedMessage}
        />
        <div
          className={`${styles["options-tab"]} position-absolute align-items-center bg-dark border border-dark rounded-3 end-0 bottom-100 me-3`}
        >
          <Options msg={msg} handleEditableMsg={handleEditableMsg} />
        </div>
      </div>
    </>
  );
};

export default DmItem;
