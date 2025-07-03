import React from "react";
import { useEffect } from "react";
import Form from "react-bootstrap/Form";
import TextareaAutosize from "react-textarea-autosize";

const EditDm = ({
  msg,
  styles,
  editedMessage,
  setEditedMessage,
  editInpRef,
  handleEdit,
}) => {
  return (
    <>
      <Form
        className={`d-flex align-items-center ${styles["message-form"]} ${
          editedMessage.id != null
            ? editedMessage.id != msg.id
              ? "d-none"
              : ""
            : "d-none"
        } rounded-3 p-3 gap-3 custom-scrollbar`}
      >
        <TextareaAutosize
          maxRows={20}
          ref={editInpRef}
          id={styles["edit-input"]}
          className={`border-0 bg-transparent text-white w-100`}
          value={editedMessage.message}
          onChange={(e) => {
            setEditedMessage((prev) => ({
              ...prev,
              message: e.target.value,
            }));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEdit(msg.id);
            } else if (e.key === "Escape") {
              setEditedMessage({
                id: null,
                message: "",
              });
            }
          }}
        />
      </Form>
    </>
  );
};

export default EditDm;
