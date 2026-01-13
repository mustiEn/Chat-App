import { create } from "zustand";

export const useHeaderStore = create((set) => ({
  header: "",
  setHeader: (content) =>
    set({
      header: content,
    }),
}));
