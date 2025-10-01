import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import { RxCross2, RxDrawingPin } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import stylesPanelTop from "../css/dm_panel_top.module.css";
import PinnedMsgsBox from "./PinnedMsgsBox";
import Popover from "./Popover";
import { useOutletContext, useParams } from "react-router-dom";
import styles from "../css/dm_panel.module.css";
import { socket } from "../socket";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const DmPanelTop = ({ receiver, handleOffsetToggle, showOffset }) => {
  const { userId: receiverId } = useParams();
  const { setDmChat } = useOutletContext();
  const [pinnedMsgsState, setPinnedMsgsState] = useState({
    newPinnedMsgExists: false,
    showPinnedMsgs: false,
  });
  const [search, setSearch] = useState("");
  const pinnedMsgsBoxRef = useRef(null);
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
    queryFn: async () => {
      const res = await fetch(`/api/dm/pinned-messages/${receiverId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      return data;
    },
    enabled: false,
  });
  const prevDataUpdatedAtRef = useRef(dataUpdatedAt);
  const handlePinnedMsgs = useCallback(
    ({ result: newPinnedMsgs, isPinned }) => {
      console.log("func running");

      if (isPinned == "recovery") {
        let isPinnedMsgAdded = false;

        setDmChat((prev) => {
          const replaceState = () => {
            isPinnedMsgAdded = true;
            return {
              ...prev,
              pinnedMsgs: {
                ...prev.pinnedMsgs,
                [receiverId]: newPinnedMsgs,
              },
            };
          };

          if (!prev.pinnedMsgs[receiverId]) {
            return replaceState();
          } else if (
            prev.pinnedMsgs[receiverId].length != newPinnedMsgs.length
          ) {
            return replaceState();
          } else {
            const isIdInTheSameIndex = newPinnedMsgs.every(
              (e, i) => e.id == prev.pinnedMsgs[receiverId][i].id
            );

            if (!isIdInTheSameIndex) return replaceState();
          }
        });

        if (isPinnedMsgAdded && !pinnedMsgsState.showPinnedMsgs) {
          setPinnedMsgsState((prev) => ({ ...prev, newPinnedMsgExists: true }));
        }
      } else if (isPinned) {
        const isPinnedMsgFromReceiver = newPinnedMsgs.pinned_by == receiverId;
        console.log("pinned");

        setDmChat((prev) => ({
          ...prev,
          pinnedMsgs: {
            ...prev.pinnedMsgs,
            [receiverId]: [
              newPinnedMsgs,
              ...(prev.pinnedMsgs[receiverId] ?? []),
            ],
          },
        }));

        if (!pinnedMsgsState.showPinnedMsgs && isPinnedMsgFromReceiver) {
          setPinnedMsgsState((prev) => ({ ...prev, newPinnedMsgExists: true }));
        }
      } else {
        console.log("not pinned");

        setDmChat((prev) => {
          const filteredPinnedMsgs = prev.pinnedMsgs[receiverId].filter(
            (m) => m.id != newPinnedMsgs.id
          );
          return {
            ...prev,
            pinnedMsgs: {
              ...prev.pinnedMsgs,
              [receiverId]: filteredPinnedMsgs,
            },
          };
        });
      }
    },
    [pinnedMsgsState.showPinnedMsgs, receiverId]
  );

  // if (isError) toast.error(error.message);

  useEffect(() => {
    if (!isSuccess) return;

    const isDataNew = prevDataUpdatedAtRef.current != dataUpdatedAt;
    prevDataUpdatedAtRef.current = dataUpdatedAt;

    if (!isDataNew) return;

    setDmChat((prev) => ({
      ...prev,
      pinnedMsgs: {
        ...prev.pinnedMsgs,
        [receiverId]: data,
      },
    }));
  }, [data]);

  useEffect(() => {
    const closePinnedMsgsBox = (event) => {
      const anyModalExists = document.querySelector(".fade.modal.show");

      if (!pinnedMsgsState.showPinnedMsgs) return;
      if (anyModalExists) return;
      if (
        pinnedMsgsBoxRef.current &&
        !pinnedMsgsBoxRef.current.contains(event.target)
      ) {
        setPinnedMsgsState((prev) => ({ ...prev, showPinnedMsgs: false }));
      }
    };

    document.addEventListener("click", closePinnedMsgsBox);

    return () => {
      document.removeEventListener("click", closePinnedMsgsBox);
    };
  }, [pinnedMsgsState.showPinnedMsgs]);

  useEffect(() => {
    socket.on("receive pinned msgs", handlePinnedMsgs);
    console.log(111);

    return () => {
      socket.off("receive pinned msgs", handlePinnedMsgs);
    };
  }, [handlePinnedMsgs]);

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
                    if (!pinnedMsgsState.showPinnedMsgs) e.stopPropagation();

                    setPinnedMsgsState({
                      showPinnedMsgs: true,
                      newPinnedMsgExists: false,
                    });

                    if (!isFetched) refetch();
                  }}
                >
                  <RxDrawingPin
                    id="drawingPin"
                    className={`ms-auto fs-5 ${
                      pinnedMsgsState.showPinnedMsgs && stylesPanelTop["active"]
                    } ${stylesPanelTop["dm-panel-top-icon"]}`}
                  />
                  {pinnedMsgsState.newPinnedMsgExists && (
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
          showPinnedMsgs={pinnedMsgsState.showPinnedMsgs}
          isPending={isLoading}
        />
      </div>
    </>
  );
};

export default DmPanelTop;
