import React, { useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/Modal";
import { formatDate } from "../utils";
import toast from "react-hot-toast";
import DmContext from "../contexts/DmContext";
import { socket } from "../socket";
import styles from "../css/delete_pinned_msg_modal.module.css";

const DeletePinnedMsgModal = ({
  show,
  handleDeletePinnedMsgModal,
  activePinnedMsg,
}) => {
  const unPinMessage = async () => {
    if (!socket.connected) {
      toast.error("We couldn't unpin the message");
      return;
    }
    socket.emit(
      "pinned msgs",
      {
        id: activePinnedMsg.id,
        isPinned: false,
      },
      (err, res) => {
        if (err) {
          console.log("err", err);
        } else {
          console.log("res", res);
        }
      }
    );
    handleDeletePinnedMsgModal(false);
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => handleDeletePinnedMsgModal(false)}
        centered
        data-bs-theme="dark"
      >
        <Modal.Header>
          <Modal.Title>Unpin Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2">
            You sure you want to remove this pinned message ?
          </div>
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
                <div className="fw-bold">{activePinnedMsg.display_name}</div>
                <span className={`${styles["timestamp"]} text-muted`}>
                  {formatDate(activePinnedMsg.created_at)}
                </span>
              </div>
              <div className={`${styles["message-content"]}`}>
                {activePinnedMsg.message}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => handleDeletePinnedMsgModal(false)}
          >
            Close
          </Button>
          <Button variant="danger" onClick={unPinMessage}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeletePinnedMsgModal;
