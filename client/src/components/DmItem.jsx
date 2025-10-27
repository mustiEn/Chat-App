import React, { useCallback, useState } from "react";
import Options from "./Options.jsx";
("../contexts/DmContext.jsx");
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import DmItemInner from "./DmItemInner.jsx";
import styles from "../css/dm_panel.module.css";
import { Box } from "@mantine/core";

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
      <Box
        id={`message-${msg?.id}`}
        className={styles["message"]}
        p={7}
        w={"100%"}
        style={{
          position: "relative",
          borderRadius: 7,
        }}
      >
        <DmItemInner
          msg={msg}
          editedMessage={editedMessage}
          setEditedMessage={setEditedMessage}
        />
        <Box className={styles["options-tab"]}>
          <Options msg={msg} handleEditableMsg={handleEditableMsg} />
        </Box>
      </Box>
    </>
  );
};

export default DmItem;
