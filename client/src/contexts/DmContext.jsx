import React from "react";
import { createContext } from "react";

const DmContext = createContext({
  chatData: null,
  pendingMessages: [],
  setChatData: () => {},
});

export default DmContext;
