import React, { useEffect, useRef } from "react";
import { RxDrawingPin, RxCross2 } from "react-icons/rx";
import styles from "../css/pinned_msgs_modal.module.css";
import panelStyles from "../css/dm_panel.module.css";
import Button from "react-bootstrap/esm/Button";
import { useState } from "react";
import PinnedMsgsDeleteModal from "./PinnedMsgsDeleteModal";
import { formatDate } from "../utils";
import { HiOutlineFaceFrown } from "react-icons/hi2";
import { Link, useParams } from "react-router-dom";
import { useContext } from "react";
import DmContext from "../contexts/DmContext";
import toast from "react-hot-toast";
import { PulseLoader } from "react-spinners";

const PinnedMsgsModal = ({
  ref,
  showPinnedMsgs,
  pinnedMsgsProp,
  isPending,
  setShowPinnedMsgsDeleteModal,
  showPinnedMsgsDeleteModal,
  handlePinnedMsgsToggle,
}) => {
  const { userId: receiverId } = useParams();
  const [pinnedMsg, setPinnedMsg] = useState({});
  const [pinnedMsgs, setPinnedMsgs] = useState(pinnedMsgsProp);
  const [direction, setDirection] = useState("");
  const {
    chatData: { hasMoreUp, hasMoreDown, isPinnedMsgViewOpen },
    setChatData,
  } = useContext(DmContext);
  const handlePinnedMsgsDeleteModal = (val) =>
    setShowPinnedMsgsDeleteModal(val);

  const jumpToMsg = async (msg) => {
    const div = document.getElementById(`message-${msg.id}`);

    setChatData((prev) => ({
      ...prev,
      isPinnedMsgViewOpen: div ? false : true,
      jumpToMsgId: div ? null : msg.id,
      hasMoreUp: true,
      hasMoreDown: div ? false : true,
      pinnedMessagesView: [],
    }));

    if (div) {
      div.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setTimeout(() => {
        div.classList.add(panelStyles.active);
        setTimeout(() => {
          div.classList.remove(panelStyles.active);
        }, 3000);
      }, 500);
    }
  };

  useEffect(() => {
    setPinnedMsgs(pinnedMsgsProp);
  }, [pinnedMsgsProp]);

  return (
    <>
      <div
        id={styles["pinnedMsgsModal"]}
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
                  <Button
                    size="sm"
                    className="jump py-0 px-2"
                    variant="outline-info"
                    style={{ fontSize: 10 }}
                    onClick={() => {
                      handlePinnedMsgsToggle(false);
                      jumpToMsg(msg);
                    }}
                  >
                    Jump
                  </Button>
                  <RxCross2
                    className={`${styles["modal-icon"]}`}
                    onClick={() => {
                      handlePinnedMsgsDeleteModal(true);
                      setPinnedMsg(msg);
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <PinnedMsgsDeleteModal
        show={showPinnedMsgsDeleteModal}
        handlePinnedMsgsDeleteModal={handlePinnedMsgsDeleteModal}
        pinnedMsg={pinnedMsg}
        setPinnedMsgs={setPinnedMsgs}
        styles={styles}
      />
    </>
  );
};

export default PinnedMsgsModal;
