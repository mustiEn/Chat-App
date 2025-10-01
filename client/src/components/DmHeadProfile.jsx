import React, { useContext } from "react";
import Button from "react-bootstrap/esm/Button";
import { LuDot } from "react-icons/lu";
import { useOutletContext, useParams } from "react-router-dom";

const DmHeadProfile = ({ receiver }) => {
  return (
    <>
      <div className={`m-2`}>
        <img
          src={receiver.profile ? receiver.profile : "https://placehold.co/80"}
          className="rounded-circle"
          alt=""
        />
        <div
          style={{
            fontSize: 24,
          }}
        >
          {receiver.display_name}
        </div>
        <div
          style={{
            fontSize: 20,
          }}
        >
          {receiver.username}
        </div>
        <div className="d-flex align-items-center gap-2">
          <div>No Mutual Groups</div>
          <LuDot />
          <Button variant="primary" size="sm">
            Add Friend
          </Button>
          <Button variant="light" size="sm">
            Block
          </Button>
        </div>
      </div>
    </>
  );
};

export default DmHeadProfile;
