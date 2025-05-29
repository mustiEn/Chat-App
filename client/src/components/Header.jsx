import React from "react";

const Header = ({ content }) => {
  return (
    <>
      <div
        className="w-100 text-center text-white fs-5"
        style={{ backgroundColor: "#121214" }}
      >
        {content}
      </div>
    </>
  );
};

export default Header;
