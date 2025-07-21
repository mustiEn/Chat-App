import React, { useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/Modal";
import { formatDate } from "../utils";
import toast from "react-hot-toast";
import DmContext from "../contexts/DmContext";

const DeletePinnedMsgsModal = ({
  show,
  handleDeletePinnedMsgsModal,
  pinnedMsg,
  styles,
}) => {
  const { setChatData } = useContext(DmContext);
  const deletePinnedMessage = async () => {
    try {
      const res = await fetch(`/api/delete-pinned-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinnedMsgId: pinnedMsg.id,
        }),
      });

      if (!res.ok) throw new Error("Something went wrong");

      setChatData((prev) => ({
        ...prev,
        pinnedMsgs: prev.pinnedMsgs.filter((msg) => msg.id !== pinnedMsg.id),
      }));
      handleDeletePinnedMsgsModal(false);
      toast.success("Message unpinned");
    } catch (error) {
      console.log(error);
      toast.error(error.error);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => handleDeletePinnedMsgsModal(false)}
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
                <div className="fw-bold">{pinnedMsg.display_name}</div>
                <span className={`${styles["timestamp"]} text-muted`}>
                  {formatDate(pinnedMsg.created_at)}
                </span>
              </div>
              <div className={`${styles["message-content"]}`}>
                {pinnedMsg.message}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => handleDeletePinnedMsgsModal(false)}
          >
            Close
          </Button>
          <Button variant="danger" onClick={deletePinnedMessage}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeletePinnedMsgsModal;
