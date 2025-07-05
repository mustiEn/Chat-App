import React from "react";
import { createContext } from "react";

const DmContext = createContext({
  chatData: null,
  setChatData: () => {},
});

export default DmContext;
