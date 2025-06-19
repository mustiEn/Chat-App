import React, { useEffect } from "react";
import { RxDrawingPin } from "react-icons/rx";

const PinnedMsgsModal = ({ ref, show }) => {
  const msgs = [{ text: "hey" }, { text: "hello" }];

  return (
    <>
      <div
        style={{
          width: 420,
          height: 380,
          backgroundColor: "rgb(25, 25, 25)",
          borderColor: "rgb(25, 25, 25)",
        }}
        ref={ref}
        className={show ? "border rounded-3" : "d-none"}
      >
        <div className="d-flex align-items-center gap-2">
          <RxDrawingPin className="ms-auto fs-5" />
          <div className="fs-4">Pinned Messages</div>
        </div>
        <hr />
        <div className="d-flex flex-column gap-2 mx-2">
          {msgs.map((i, a) => (
            <div key={a}>
              <img src="https://placehold.co/25" alt="" />
              <div className="fw-bold">
                Github2Dev
                <span style={{ fontSize: 10, color: "white" }}>
                  12/05/2023, 10:03
                </span>
              </div>
              <div>{i.text}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PinnedMsgsModal;
