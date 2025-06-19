import React, { createContext } from "react";

const HeaderContext = createContext({
  header: null,
  setHeader: () => {},
});

export default HeaderContext;
