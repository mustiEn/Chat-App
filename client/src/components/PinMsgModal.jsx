import React, { useContext } from "react";
import styles from "../css/pin_msg_modal.module.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import DmContext from "../contexts/DmContext";
import { formatDate } from "../utils";
import { socket } from "../socket";
import toast from "react-hot-toast";

const PinMsgModal = ({ show, handlePinMsgModal, activeMsg }) => {
  const pinMessage = () => {
    if (!socket.connected) {
      toast.error("We couldn't pin the message");
      return;
    }
    socket.emit(
      "pinned msgs",
      {
        id: activeMsg.id,
        isPinned: true,
      },
      (err, res) => {
        if (err) {
          console.log("err", err);
        } else {
          console.log("res", res);
        }
      }
    );
    handlePinMsgModal();
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => handlePinMsgModal()}
        centered
        data-bs-theme="dark"
      >
        <Modal.Header>
          <Modal.Title>Pin Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2">You sure you want to pin this message ?</div>
          <div
            className={`${styles["pinned-msg"]} d-flex align-items-center gap-2 p-2 border border-white border-opacity-25 rounded-3 position-relative`}
          >
            <img
              src="https://placehold.co/40"
              className="align-self-baseline rounded-circle"
              width={40}
              height={40}
              alt=""
            />
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center gap-2">
                <div className="fw-bold">{activeMsg.display_name}</div>
                <span className={`${styles["timestamp"]} text-muted`}>
                  {formatDate(activeMsg.created_at)}
                </span>
              </div>
              <div className={`${styles["message-content"]}`}>
                {activeMsg.message}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handlePinMsgModal()}>
            Close
          </Button>
          <Button variant="success" onClick={pinMessage}>
            Pin
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PinMsgModal;
