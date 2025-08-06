import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { socket } from "../socket";
import { formatDate } from "../utils";
import styles from "../css/pinned_msgs_box.module.css";

const DmModalNotifier = ({ type, func, setModal, activeMsg, show }) => {
  return (
    <>
      <Modal
        show={show}
        onHide={() =>
          setModal({
            show: false,
            activeMsg: null,
          })
        }
        centered
        data-bs-theme="dark"
      >
        <Modal.Header>
          <Modal.Title>{type} Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2">
            You sure you want to {type?.toLowerCase()} this message ?
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
                <div className="fw-bold">{activeMsg?.display_name}</div>
                <span className={`${styles["timestamp"]} text-muted`}>
                  {formatDate(activeMsg?.created_at)}
                </span>
              </div>
              <div className={`${styles["message-content"]}`}>
                {activeMsg?.message}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setModal({
                show: false,
                activeMsg: null,
              })
            }
          >
            Close
          </Button>
          <Button variant="success" onClick={() => func(activeMsg)}>
            {type}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DmModalNotifier;
