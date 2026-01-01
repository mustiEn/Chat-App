import { createContext } from "react";

export const DmPanelContext = createContext({
  receiverId: null,
  activeMsg: null,
});
