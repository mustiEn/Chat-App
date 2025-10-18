import React, { useEffect, useRef, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import { RxCross2, RxDrawingPin } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import stylesPanelTop from "../css/dm_panel_top.module.css";
import PinnedMsgsBox from "./PinnedMsgsBox";
import Popover from "./Popover";
import { useParams } from "react-router-dom";
import styles from "../css/dm_panel.module.css";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useShallow } from "zustand/shallow";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore";
import { useNewPinnedMsgIndicatorStore } from "../stores/useNewPinnedMsgIndicatorStore";

const DmPanelTop = ({ receiver, handleOffsetToggle, showOffset }) => {
  const { userId: receiverId } = useParams();
  const [showPinnedMsgBox, addToShowPinnedMsgBox] = useShowPinnedMsgBoxStore(
    useShallow((state) => [state.showPinnedMsgBox, state.addToShowPinnedMsgBox])
  );
  const [newPinnedMsgExists, addToNewPinnedMsgExists] =
    useNewPinnedMsgIndicatorStore(
      useShallow((state) => [
        state.newPinnedMsgExists,
        state.addToNewPinnedMsgExists,
      ])
    );
  const [search, setSearch] = useState("");
  const pinnedMsgsBoxRef = useRef(null);
  const getPinnedMessages = async () => {
    const res = await fetch(`/api/dm/pinned-messages/${receiverId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  };
  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    isFetched,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["pinnedMsgs", receiverId],
    queryFn: getPinnedMessages,
    staleTime: Infinity,
    enabled: false,
  });

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);
  // if (isError) toast.error(error.message);

  useEffect(() => {
    const closePinnedMsgsBox = (event) => {
      const isAnyModalShown = document.querySelector(".fade.modal.show");

      if (!showPinnedMsgBox[receiverId]) return;
      if (isAnyModalShown) return;
      if (
        pinnedMsgsBoxRef.current &&
        !pinnedMsgsBoxRef.current.contains(event.target)
      ) {
        addToShowPinnedMsgBox(receiverId, false);
      }
    };

    document.addEventListener("click", closePinnedMsgsBox);

    return () => {
      document.removeEventListener("click", closePinnedMsgsBox);
    };
  }, []);

  return (
    <>
      <div className="border-bottom border-opacity-25 border-white w-100 position-relative">
        <div
          className="d-flex px-2 w-100 text-white mt-2 mb-1"
          style={{ height: 38 }}
        >
          <div className="d-flex align-items-center gap-2">
            <img src="https://placehold.co/25" alt="" />
            <div className="fs-6">{receiver.display_name}</div>
          </div>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <Popover
              content={
                <div className="fw-bold popover-content">Pinned Messages</div>
              }
              trigger={
                <div
                  className="position-relative"
                  onClick={(e) => {
                    if (!showPinnedMsgBox[receiverId]) e.stopPropagation();
                    addToShowPinnedMsgBox(receiverId, true);
                    addToNewPinnedMsgExists(receiverId, false);

                    if (!isFetched) refetch();
                  }}
                >
                  <RxDrawingPin
                    id="drawingPin"
                    className={`ms-auto fs-5 ${
                      showPinnedMsgBox[receiverId] && stylesPanelTop["active"]
                    } ${stylesPanelTop["dm-panel-top-icon"]}`}
                  />
                  {newPinnedMsgExists[receiverId] && (
                    <div
                      className="position-absolute rounded-circle"
                      style={{
                        border: "1px solid black",
                        backgroundColor: "red",
                        width: 10,
                        height: 10,
                        transform: "translate(10px, -10px)",
                      }}
                    ></div>
                  )}
                </div>
              }
              placement="bottom"
            />
            <Popover
              content={
                <div className="fw-bold popover-content">
                  {showOffset ? "Hide" : "Show"} User Profile
                </div>
              }
              trigger={
                <CgProfile
                  className={`me-1 fs-5 ${
                    showOffset && stylesPanelTop["active"]
                  } ${stylesPanelTop["dm-panel-top-icon"]}`}
                  onClick={handleOffsetToggle}
                />
              }
              placement="bottom"
            />
            <div className="position-relative">
              <Form.Control
                type="search"
                size="sm"
                data-bs-theme="dark"
                placeholder="Search"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <HiMagnifyingGlass
                className={
                  search != ""
                    ? "d-none"
                    : "position-absolute top-50 end-0 translate-middle-y me-3"
                }
              />
              <RxCross2
                id={`${styles["cross"]}`}
                className={
                  search == ""
                    ? "d-none"
                    : "position-absolute top-50 end-0 translate-middle-y me-3"
                }
                onClick={() => setSearch("")}
              />
            </div>
          </div>
        </div>
        <PinnedMsgsBox ref={pinnedMsgsBoxRef} isPending={isLoading} />
      </div>
    </>
  );
};

export default DmPanelTop;
