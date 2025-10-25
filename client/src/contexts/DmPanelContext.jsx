import { createContext } from "react";

export const DmPanelContext = createContext({
  open: () => {},
  setActiveMsg: () => {},
  opened: false,
  close: () => {},
  activeMsg: null,
});
