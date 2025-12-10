import React from "react";
import { useRef } from "react";

const useDebounce = (fn, delay) => {
  const timer = useRef();
  return (...args) => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => fn(...args), delay);
  };
};

export default useDebounce;
