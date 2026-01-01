import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useModalStore = create(
  immer((set) => ({
    panelModalNotifierOpened: false,
    openPanelModalNotifier: () =>
      set((state) => {
        state.panelModalNotifierOpened = true;
      }),
    closePanelModalNotifier: () =>
      set((state) => {
        state.panelModalNotifierOpened = false;
      }),
  }))
);
