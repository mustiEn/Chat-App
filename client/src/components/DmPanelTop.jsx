import React, { useEffect, useRef, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import { RxCross2, RxDrawingPin } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import stylesPanelTop from "../css/dm_panel_top.module.css";
import PinnedMsgsModal from "./PinnedMsgsModal";
import Popover from "./Popover";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

const DmPanelTop = ({ receiver, handleOffsetToggle, showOffset, styles }) => {
  const [search, setSearch] = useState("");
  const { userId: receiverId } = useParams();
  const [isPinnedMsgsFetched, setIsPinnedMsgsFetched] = useState(false);
  const [showPinnedMsgs, setShowPinnedMsgs] = useState(false);
  const [pinnedMsgs, setPinnedMsgs] = useState([]);
  const handlePinnedMsgsToggle = () => setShowPinnedMsgs((prev) => !prev);
  const [showPinnedMsgsDeleteModal, setShowPinnedMsgsDeleteModal] =
    useState(false);
  const pinnedMsgsModalRef = useRef(null);
  const [isPending, setIsPending] = useState(false);
  let isOpen = false;
  const handleClosePinnedMsgs = (event) => {
    const deleteModal = document.querySelector(".fade.modal.show");
    if (isOpen && !deleteModal) {
      isOpen = false;
      return;
    } else if (deleteModal) {
      isOpen = true;
      return;
    } else if (
      pinnedMsgsModalRef.current &&
      !pinnedMsgsModalRef.current.contains(event.target)
    ) {
      setShowPinnedMsgs(false);
    }
  };
  const fetchPinnedMsgs = async () => {
    if (isPinnedMsgsFetched) return;
    setIsPending(true);
    try {
      const res = await fetch(`/api/dm/pinned-messages/${receiverId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setPinnedMsgs(data);
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
    setIsPending(false);
    setIsPinnedMsgsFetched(true);
  };
  const clearSearch = () => setSearch("");

  useEffect(() => {
    document.addEventListener("click", handleClosePinnedMsgs);
    return () => {
      document.removeEventListener("click", handleClosePinnedMsgs);
    };
  }, []);

  useEffect(() => {
    setIsPinnedMsgsFetched(false);
  }, [receiverId]);

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
                <RxDrawingPin
                  className={`ms-auto fs-5 ${
                    showPinnedMsgs && stylesPanelTop["active"]
                  } ${stylesPanelTop["dm-panel-top-icon"]}`}
                  onClick={async (e) => {
                    e.stopPropagation();
                    handlePinnedMsgsToggle();
                    await fetchPinnedMsgs();
                  }}
                />
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
                onClick={clearSearch}
              />
            </div>
          </div>
        </div>
        <PinnedMsgsModal
          ref={pinnedMsgsModalRef}
          pinnedMsgsProp={pinnedMsgs}
          showPinnedMsgs={showPinnedMsgs}
          isPending={isPending}
          setShowPinnedMsgsDeleteModal={setShowPinnedMsgsDeleteModal}
          showPinnedMsgsDeleteModal={showPinnedMsgsDeleteModal}
          handlePinnedMsgsToggle={handlePinnedMsgsToggle}
        />
      </div>
    </>
  );
};

export default DmPanelTop;
