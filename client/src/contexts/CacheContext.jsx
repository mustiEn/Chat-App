import { createContext } from "react";

export const CachedContext = createContext({
  cachedChat: new Map(),
  setCachedChat: () => {},
  cachedReceiver: new Map(),
  setCachedReceiver: () => {},
});
