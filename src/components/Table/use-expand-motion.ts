import { useLayoutEffect, useRef, useState, type TransitionEvent } from "react";
import { MOTION_DURATION_MID } from "../_internal/motion";

export function useExpandMotion(expanded: boolean, appear = false) {
  const [rendered, setRendered] = useState(expanded);
  const [visible, setVisible] = useState(expanded && !appear);
  const renderedRef = useRef(expanded);
  const readyRef = useRef(expanded && !appear);

  useLayoutEffect(() => {
    let frame: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (expanded) {
      renderedRef.current = true;
      setRendered(true);
      if (readyRef.current) {
        // Reverse an unfinished close without restarting at zero.
        setVisible(true);
      } else {
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            readyRef.current = true;
            setVisible(true);
          });
        });
      }
    } else {
      setVisible(false);
      if (renderedRef.current) {
        timer = setTimeout(() => {
          renderedRef.current = false;
          readyRef.current = false;
          setRendered(false);
        }, MOTION_DURATION_MID + 50);
      }
    }
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [expanded]);

  const onTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === "grid-template-rows" &&
      !expanded
    ) {
      renderedRef.current = false;
      readyRef.current = false;
      setRendered(false);
    }
  };
  return { rendered, visible, onTransitionEnd };
}
