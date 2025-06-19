import React, { useEffect, useRef, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import { RxCross2, RxDrawingPin } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import styles from "../css/dm_panel_top.module.css";
import PinnedMsgsModal from "./PinnedMsgsModal";

const DmPanelTop = ({ user }) => {
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const handleCloseDiv = (event) => {
    // console.log("clicked outside");
    if (ref.current && !ref.current.contains(event.target)) {
      // console.log("clicked outside 11");
      setShow(false);
    }
  };
  const clearSearch = () => setSearch("");

  useEffect(() => {
    document.addEventListener("click", handleCloseDiv);

    return () => {
      document.removeEventListener("click", handleCloseDiv);
    };
  }, []);

  return (
    <>
      <div className="border-bottom border-opacity-25 border-white w-100">
        <div
          className="d-flex px-2 w-100 text-white mt-2 mb-1"
          style={{ height: 38 }}
        >
          <div className="d-flex align-items-center gap-2">
            <img src="https://placehold.co/25" alt="" />
            <div className="fs-6">Dev2Github</div>
          </div>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <RxDrawingPin
              className="ms-auto fs-5"
              onClick={(e) => {
                e.stopPropagation();
                setShow(true);
              }}
            />
            <CgProfile className="me-1 fs-5" />
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
      </div>
      <PinnedMsgsModal ref={ref} show={show} />
    </>
  );
};

export default DmPanelTop;
