import React, { useEffect, useRef, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
// import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import { RxCross2, RxDrawingPin } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import PinnedMsgsBox from "./PinnedMsgsBox";
import PopoverComponent from "./PopoverComponent";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useShowPinnedMsgBoxStore } from "../stores/useShowPinnedMsgBoxStore.js";
import { useNewPinnedMsgIndicatorStore } from "../stores/useNewPinnedMsgIndicatorStore.js";
import { useReceiverStore } from "../stores/useReceiverStore.js";
import { Box, Popover, Text, Button, Flex } from "@mantine/core";
import stylesPanelTop from "../css/dm_panel_top.module.css";
import styles from "../css/dm_panel.module.css";

const DmPanelTop = ({ handleOffsetToggle, showOffset }) => {
  const { userId: receiverId } = useParams();
  const customOverlayRef = useRef();
  const receiver = useReceiverStore((state) => state.receivers[receiverId]);
  const showPinnedMsgBox = useShowPinnedMsgBoxStore(
    (state) => state.showPinnedMsgBox
  );
  const addToShowPinnedMsgBox = useShowPinnedMsgBoxStore(
    (state) => state.addToShowPinnedMsgBox
  );
  const newPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (state) => state.newPinnedMsgExists
  );
  const addToNewPinnedMsgExists = useNewPinnedMsgIndicatorStore(
    (state) => state.addToNewPinnedMsgExists
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
    queryKey: ["pinnedMessages", receiverId],
    queryFn: getPinnedMessages,
    staleTime: Infinity,
    enabled: false,
  });

  // if (isError) toast.error(error.message);

  useEffect(() => {
    if (showPinnedMsgBox[receiverId])
      customOverlayRef.current.style.display = "block";
    const closePinnedMsgsBox = (event) => {
      const isTargetOverlay = event.target.classList.contains(
        customOverlayRef.current.className
      );
      // console.log(event.target);
      // console.log("box is closing...");
      // console.log(
      //   isTargetOverlay,
      //   event.target.classList,
      //   customOverlayRef.current.className
      // );

      if (!isTargetOverlay) return;

      customOverlayRef.current.style.display = "none";
      addToShowPinnedMsgBox(receiverId, false);
    };

    document.addEventListener("click", closePinnedMsgsBox);

    return () => {
      document.removeEventListener("click", closePinnedMsgsBox);
    };
  }, [showPinnedMsgBox]);

  return (
    <>
      <div
        className={stylesPanelTop["custom-overlay"]}
        ref={customOverlayRef}
      ></div>
      <Box className={"panel-top"}>
        <Flex h={"100%"} w={"100%"} c={"white"} pr={10} pl={10}>
          <div className="d-flex align-items-center gap-2">
            <img src="https://placehold.co/25" alt="" />
            <div className="fs-6">{receiver?.display_name}</div>
          </div>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <PopoverComponent
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
              position="bottom"
            />
            <PopoverComponent
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
              position="bottom"
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
        </Flex>
        <PinnedMsgsBox
          customOverlayRef={customOverlayRef}
          ref={pinnedMsgsBoxRef}
          isPending={isLoading}
        />
      </Box>
    </>
  );
};

export default DmPanelTop;
