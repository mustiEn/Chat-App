import React, { useContext, useEffect, useRef, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import { RxCross2, RxDrawingPin } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import stylesPanelTop from "../css/dm_panel_top.module.css";
import PinnedMsgsBox from "./PinnedMsgsBox";
import Popover from "./Popover";
import { useParams } from "react-router-dom";
import DmContext from "../contexts/DmContext";
import toast from "react-hot-toast";
import { socket } from "../socket";

const DmPanelTop = ({ receiver, handleOffsetToggle, showOffset, styles }) => {
  let isOpen = false;
  const { userId: receiverId } = useParams();
  const [search, setSearch] = useState("");
  const {
    chatData: { pinnedMsgs },
    setChatData,
  } = useContext(DmContext);
  const [showPinnedMsgs, setShowPinnedMsgs] = useState(false);
  const [newPinnedMsgExists, setNewPinnedMsgExists] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const pinnedMsgsBoxRef = useRef(null);
  const isPinnedMsgsFetched = useRef(false);
  const closePinnedMsgsBox = (event) => {
    const deleteModal = document.querySelector(".fade.modal.show");
    if (isOpen && !deleteModal) {
      isOpen = false;
      return;
    } else if (deleteModal) {
      isOpen = true;
      return;
    } else if (
      pinnedMsgsBoxRef.current &&
      !pinnedMsgsBoxRef.current.contains(event.target)
    ) {
      setShowPinnedMsgs(false);
    }
  };
  const fetchPinnedMsgs = async () => {
    if (isPinnedMsgsFetched.current) return;
    setIsPending(true);
    try {
      const res = await fetch(`/api/dm/pinned-messages/${receiverId}`);
      const data = await res.json();

      if (!res.ok) {
        setIsPending(false);
        throw new Error(data.message);
      }

      setChatData((prev) => ({
        ...prev,
        pinnedMsgs: data,
      }));
      setIsPending(false);
      isPinnedMsgsFetched.current = true;
    } catch (error) {
      setIsPending(false);
      console.log(error.message);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    console.log(newPinnedMsgExists);
  }, [newPinnedMsgExists]);

  // useEffect(() => {
  //   console.log("pinned msg changed", pinnedMsgs);
  // }, [pinnedMsgs]);

  useEffect(() => {
    const handlePinnedMsgs = ({ result: newPinnedMsgs, isPinned }) => {
      if (isPinned == null) {
        let isPinnedMsgAdded = false;

        setChatData((prev) => {
          let pinnedMsgsMap = new Map(prev.pinnedMsgs.map((m) => [m.id, m]));
          newPinnedMsgs.forEach((m) => {
            const exists = pinnedMsgsMap.has(m.id);
            if (exists) {
              if (!m.isPinned) {
                pinnedMsgsMap.delete(m.id);
              } else {
                pinnedMsgsMap.delete(m.id);
                pinnedMsgsMap.set(m.id, m);
                isPinnedMsgAdded = true;
              }
            } else {
              pinnedMsgsMap.set(m.id, m);
              isPinnedMsgAdded = true;
            }
          });

          const sorted = [...pinnedMsgsMap.values()].sort((a, b) => {
            const dateA = new Date(a.pin_updated_at);
            const dateB = new Date(b.pin_updated_at);
            return dateB - dateA;
          });

          return {
            ...prev,
            pinnedMsgs: sorted,
          };
        });

        if (isPinnedMsgAdded) {
          setNewPinnedMsgExists(true);
        }
      } else if (isPinned) {
        const isPinnedMsgFromReceiver = newPinnedMsgs.pinned_by == receiverId;

        setChatData((prev) => ({
          ...prev,
          pinnedMsgs: [newPinnedMsgs, ...prev.pinnedMsgs],
        }));
        console.log(newPinnedMsgs);
        console.log(isPinnedMsgFromReceiver);
        if (!showPinnedMsgs && isPinnedMsgFromReceiver) {
          setNewPinnedMsgExists(true);
        }
      } else {
        setChatData((prev) => {
          const filteredPinnedMsgs = prev.pinnedMsgs.filter(
            (m) => m.id != newPinnedMsgs.id
          );

          return {
            ...prev,
            pinnedMsgs: filteredPinnedMsgs,
          };
        });
      }
    };
    socket.on("pinned msgs", handlePinnedMsgs);
    document.addEventListener("click", closePinnedMsgsBox);

    return () => {
      socket.off("pinned msgs", handlePinnedMsgs);
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
                <div className="position-relative">
                  <RxDrawingPin
                    className={`ms-auto fs-5 ${
                      showPinnedMsgs && stylesPanelTop["active"]
                    } ${stylesPanelTop["dm-panel-top-icon"]}`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setShowPinnedMsgs((prev) => !prev);
                      setNewPinnedMsgExists(false);
                      await fetchPinnedMsgs();
                    }}
                  />
                  {newPinnedMsgExists && (
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
        <PinnedMsgsBox
          ref={pinnedMsgsBoxRef}
          showPinnedMsgs={showPinnedMsgs}
          isPending={isPending}
        />
      </div>
    </>
  );
};

export default DmPanelTop;
