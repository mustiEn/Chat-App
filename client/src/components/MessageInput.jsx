import React from "react";
import Form from "react-bootstrap/Form";
import { GoPlusCircle } from "react-icons/go";
import { useRef } from "react";
import { socket } from "../socket.js";
import { useContext } from "react";
import DmContext from "../contexts/DmContext.jsx";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCallback } from "react";
import TextareaAutosize from "react-textarea-autosize";
const MessageInput = ({
  styles,
  fileInpRef,
  textInpRef,
  message,
  setMessage,
  scrollToBottom,
  handleSubmit,
}) => {
  const [isJumpClicked, setIsJumpClicked] = useState(false);
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.classList.contains === "jump") {
        setIsJumpClicked(true);
      }
      setTimeout(() => {
        setIsJumpClicked(false);
      }, 3000);
    };
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      setIsJumpClicked(false);
    };
  }, []);

  return (
    <div className="w-100 px-2 mt-auto mb-4">
      <Form
        className={`d-flex align-items-center ${styles["message-form"]} rounded-3 p-3 gap-3 custom-scrollbar mt-2`}
      >
        <div
          className="d-flex align-items-center justify-content-center align-self-baseline text-white"
          style={{
            width: 30,
            height: 30,
          }}
        >
          <Form.Control
            type="file"
            hidden
            ref={fileInpRef}
            className="file-input"
            disabled={isJumpClicked ? true : false}
          />
          <GoPlusCircle
            id={styles["fileIcon"]}
            className="fs-5"
            onClick={() => fileInpRef.current.click()}
          />
        </div>
        <TextareaAutosize
          disabled={isJumpClicked ? true : false}
          autoFocus
          ref={textInpRef}
          maxRows={20}
          id={styles["msg-input"]}
          className="border-0 bg-transparent msg-input text-white w-100"
          placeholder="Type a message..."
          value={message.message}
          style={{
            whiteSpace: "pre-wrap",
          }}
          onHeightChange={scrollToBottom}
          onChange={(e) => {
            setMessage((prev) => ({
              ...prev,
              message:
                e.nativeEvent.inputType === "insertLineBreak"
                  ? prev.message
                  : e.target.value,
            }));
          }}
          onKeyUp={(e) => e.key == "Enter" && handleSubmit(e)}
        />
      </Form>
    </div>
  );
};

export default MessageInput;
