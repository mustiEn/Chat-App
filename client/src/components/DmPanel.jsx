import React from "react";
import { useParams } from "react-router-dom";
import FriendProfile from "./FriendProfile";
import DmDisplay from "./DmDisplay";
import DmPanelTop from "./DmPanelTop";

const DmPanel = () => {
  const params = useParams();
  const { userId } = params;

  return (
    <>
      <DmPanelTop user={""} />
      <div
        className="d-flex flex-grow-1 w-100"
        style={{
          minHeight: 0,
        }}
      >
        <DmDisplay />
        <FriendProfile />
      </div>
    </>
  );
};

export default DmPanel;
