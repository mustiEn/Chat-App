import React, { useContext, useState } from "react";
import { RxDrawingPin, RxCross2 } from "react-icons/rx";
import styles from "../css/pinned_msgs_box.module.css";
import DeletePinnedMsgModal from "./DeletePinnedMsgModal";
import { formatDate } from "../utils";
import { HiOutlineFaceFrown } from "react-icons/hi2";
import DmContext from "../contexts/DmContext";
import { PulseLoader } from "react-spinners";
import { useEffect } from "react";

const PinnedMsgsBox = ({ ref, showPinnedMsgs, isPending }) => {
  const [activePinnedMsg, setActivePinnedMsg] = useState({});
  const {
    chatData: { pinnedMsgs },
  } = useContext(DmContext);
  const [showDeletePinnedMsgModal, setShowDeletePinnedMsgModal] =
    useState(false);
  const handleDeletePinnedMsgModal = (val) => {
    setShowDeletePinnedMsgModal(val);
  };

  return (
    <>
      <div
        id={styles["pinnedMsgsBox"]}
        ref={ref}
        className={
          showPinnedMsgs
            ? "border border-white border-opacity-25 rounded-3 position-absolute z-3 text-white"
            : "d-none"
        }
      >
        <div className="d-flex align-items-center gap-2 my-2">
          <RxDrawingPin className="ms-2 fs-5" />
          <div className="fs-5">Pinned Messages</div>
        </div>
        <hr className="my-0" />
        {isPending ? (
          <PulseLoader color="white" />
        ) : pinnedMsgs.length === 0 ? (
          <>
            <HiOutlineFaceFrown
              className="w-100 mt-5"
              style={{
                fontSize: "7rem",
              }}
            />
            <div className="mt-3 text-center">
              This chat doesnt have any pinned messages yet.
            </div>
          </>
        ) : (
          <ul
            className="d-flex flex-column gap-2 py-2 overflow-auto custom-scrollbar"
            style={{
              height: 330,
            }}
          >
            {pinnedMsgs.map((msg, i) => (
              <li
                key={msg.id}
                className={`${styles["pinned-msg"]} d-flex align-items-center gap-2 p-2 border border-white border-opacity-25 rounded-3 position-relative mx-1`}
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
                    <div className="fw-bold">{msg.display_name}</div>
                    <span className={`${styles["timestamp"]} text-muted`}>
                      {formatDate(msg.created_at)}
                      {/* 12/05/2023, 10:03 */}
                    </span>
                  </div>
                  <div className={`${styles["message-content"]}`}>
                    {msg.message}
                  </div>
                </div>
                <div
                  className={`gap-1 ${styles["modal-icons"]} position-absolute translate-middle end-0`}
                >
                  <RxCross2
                    className={`${styles["modal-icon"]}`}
                    onClick={() => {
                      handleDeletePinnedMsgModal(true);
                      setActivePinnedMsg(msg);
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <DeletePinnedMsgModal
        show={showDeletePinnedMsgModal}
        handleDeletePinnedMsgModal={handleDeletePinnedMsgModal}
        activePinnedMsg={activePinnedMsg}
      />
    </>
  );
};

export default PinnedMsgsBox;
