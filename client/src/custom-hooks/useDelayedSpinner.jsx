import React from "react";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";

const useDelayedSpinner = (isFetching) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!isFetching) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(true);
    }, 300);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isFetching]);

  return show;
};

export default useDelayedSpinner;
