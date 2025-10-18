import React, { useContext, useState } from "react";
import { RxDrawingPin, RxCross2 } from "react-icons/rx";
import styles from "../css/pinned_msgs_box.module.css";
import { formatDate } from "../utils";
import { HiOutlineFaceFrown } from "react-icons/hi2";

import { PulseLoader } from "react-spinners";
import DmModalNotifier from "./DmModalNotifier";
import { socket } from "../socket";
import { useOutletContext, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore";

const PinnedMsgsBox = ({ ref, isPending }) => {
  const { userId: receiverId } = useParams();
  const queryClient = useQueryClient();
  const pinnedMsgs = queryClient.getQueryData(["pinnedMsgs", receiverId]);
  const showPinnedMsgBox = useShowPinnedMsgBoxStore(
    (state) => state.showPinnedMsgBox
  );
  const [modal, setModal] = useState({
    activeMsg: null,
    show: false,
  });

  const unPinMessage = async () => {
    if (!socket.connected) {
      toast.error("We couldn't unpin the message");
      return;
    }

    socket.emit(
      "send pinned msgs",
      {
        id: modal.activeMsg.id,
        isPinned: false,
        toId: receiverId,
      },
      (err, res) => {
        if (err) {
          console.log("Error: ", err);
        }

        queryClient.setQueryData(
          ["pinnedMsgs", String(receiverId)],
          (olderData) => {
            const filteredData = olderData.filter(
              ({ id }) => id != modal.activeMsg.id
            );

            return filteredData;
          }
        );
        console.log("Unpinned successfully", res);
      }
    );

    setModal({
      activeMsg: null,
      show: false,
    });
  };

  return (
    <>
      <div
        id={styles["pinnedMsgsBox"]}
        ref={ref}
        className={
          showPinnedMsgBox[receiverId]
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
        ) : !pinnedMsgs?.length ? (
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
                    onClick={() =>
                      setModal({
                        activeMsg: msg,
                        show: true,
                      })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <DmModalNotifier
        type={"Delete"}
        func={unPinMessage}
        activeMsg={modal.activeMsg}
        show={modal.show}
        setModal={setModal}
      />
    </>
  );
};

export default PinnedMsgsBox;
