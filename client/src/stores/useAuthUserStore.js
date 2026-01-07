import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useAuthUserStore = create((set) => ({
  authUser: null,
  setAuthUser: (user) =>
    set(() => ({
      authUser: user,
    })),
}));
