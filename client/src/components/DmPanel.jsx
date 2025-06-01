import React from "react";
import { useParams } from "react-router-dom";
import FriendProfile from "./FriendProfile";

const DmPanel = () => {
  const params = useParams();
  const { userId } = params;

  return (
    <>
      <div className="text-white fs-3">DmPanel == {userId}</div>
      <FriendProfile />
    </>
  );
};

export default DmPanel;
