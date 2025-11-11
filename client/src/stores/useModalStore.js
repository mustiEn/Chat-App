import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useModalStore = create(
  immer((set) => ({
    dmModalNotifierOpened: false,
    dmModalNotifierOpen: () =>
      set((state) => {
        state.dmModalNotifierOpened = true;
      }),
    dmModalNotifierClose: () =>
      set((state) => {
        state.dmModalNotifierOpened = false;
      }),
  }))
);
