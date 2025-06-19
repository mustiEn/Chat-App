import React from "react";
import { TbDotsVertical, TbMessageCircle } from "react-icons/tb";
import FriendsPanelTop from "./FriendsPanelTop";
// import "../css/friends.css";
const OnlineFriends = () => {
  return (
    <>
      {/* <FriendsPanelTop /> */}

      <div className="position-relative">
        {/* <img
          src="icons8-star.gif"
          width={10}
          height={10}
          className="position-absolute top-0"
          alt=""
        /> */}
      </div>
      {/* <div className="gif-hover">
        <img
          className="static"
          width={300}
          height={100}
          src="static.jpg"
          alt="Static Image"
        />
        <img
          className="animated"
          width={300}
          height={100}
          src="bg.gif"
          alt="Animated GIF"
        />
      </div> */}

      <ul className="text-white mt-5 mx-2">
        <div className="mb-3">All friends - 9</div>
        {Array.from({ length: 9 }, (_, i) => (
          <li
            key={i}
            className="online-friends d-flex align-items-center gap-2 p-2"
          >
            <img
              src="https://placehold.co/32"
              className="rounded-circle"
              alt=""
            />
            <div className="d-flex flex-column">
              <div className="fw-bold" style={{ fontSize: 16 }}>
                Jack Micheal
              </div>
              <div style={{ fontSize: 14 }}>online</div>
            </div>
            <TbMessageCircle className="ms-auto" style={{ fontSize: 25 }} />
            <TbDotsVertical style={{ fontSize: 25 }} />
          </li>
        ))}
      </ul>
    </>
  );
};

export default OnlineFriends;
