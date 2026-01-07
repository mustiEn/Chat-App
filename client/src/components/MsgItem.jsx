import React, { useCallback, useState } from "react";
import Options from "./Options.jsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import MsgItemInner from "./MsgItemInner.jsx";
import { memo } from "react";
import styles from "../css/panel.module.css";
import { useEffect } from "react";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const MsgItem = memo(function MsgItem({ msg }) {
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

  // useEffect(() => {
  //   console.log("msg:", msg);
  // }, [msg.is_replied_msg_deleted]);

  return (
    <>
      <div
        id={`message-${msg?.id}`}
        className={styles["message"]}
        // p={7}
        // w={"100%"}
        style={{
          position: "relative",
          borderRadius: 7,
          padding: 7,
          width: "100%",
        }}
      >
        <MsgItemInner
          msg={msg}
          editedMessage={editedMessage}
          setEditedMessage={setEditedMessage}
        />
        <div className={styles["options-tab"]}>
          <Options msg={msg} handleEditableMsg={handleEditableMsg} />
        </div>
      </div>
    </>
  );
});

export default MsgItem;
