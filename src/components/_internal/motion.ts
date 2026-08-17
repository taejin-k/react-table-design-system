import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { FloatingPlacement } from "./floating-position";

export const MOTION_DURATION_FAST = 100;
export const MOTION_DURATION_MID = 200;
export const MOTION_DURATION_SLOW = 300;

export const MOTION_EASE_OUT_CIRC = "cubic-bezier(0.08, 0.82, 0.17, 1)";
export const MOTION_EASE_IN_OUT_CIRC = "cubic-bezier(0.78, 0.14, 0.15, 0.86)";
export const MOTION_EASE_OUT_QUINT = "cubic-bezier(0.23, 1, 0.32, 1)";
export const MOTION_EASE_IN_QUINT = "cubic-bezier(0.755, 0.05, 0.855, 0.06)";

export type MotionPhase = "idle" | "prepare" | "enter" | "leave";

export function useMotionPresence(visible: boolean, duration = MOTION_DURATION_MID) {
  const [rendered, setRendered] = useState(visible);
  const [phase, setPhase] = useState<MotionPhase>(visible ? "prepare" : "idle");
  const renderedRef = useRef(visible);
  const frameRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useLayoutEffect(() => {
    window.cancelAnimationFrame(frameRef.current ?? 0);
    window.clearTimeout(timerRef.current);

    if (visible) {
      renderedRef.current = true;
      setRendered(true);
      setPhase("prepare");
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = window.requestAnimationFrame(() => setPhase("enter"));
      });
      return;
    }

    if (!renderedRef.current) {
      setPhase("idle");
      return;
    }

    setPhase("leave");
    timerRef.current = window.setTimeout(() => {
      renderedRef.current = false;
      setRendered(false);
      setPhase("idle");
    }, duration);
  }, [duration, visible]);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(frameRef.current ?? 0);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  return {
    rendered,
    phase,
    motionVisible: visible && phase !== "prepare",
  };
}

export function getPopupMotionStyle(
  placement: FloatingPlacement | undefined,
  visible: boolean,
): CSSProperties {
  const vertical = placement?.startsWith("top") || placement?.startsWith("bottom");
  const horizontal = placement?.startsWith("left") || placement?.startsWith("right");
  const transformOrigin = placement?.startsWith("top")
    ? "center bottom"
    : placement?.startsWith("bottom")
      ? "center top"
      : placement?.startsWith("left")
        ? "right center"
        : "left center";

  return {
    opacity: visible ? 1 : 0,
    transform: vertical
      ? `scaleY(${visible ? 1 : 0.8})`
      : horizontal
        ? `scaleX(${visible ? 1 : 0.8})`
        : `scale(${visible ? 1 : 0.8})`,
    transformOrigin,
    transitionDuration: `${MOTION_DURATION_MID}ms`,
    transitionProperty: "opacity, transform",
    transitionTimingFunction: visible ? MOTION_EASE_OUT_QUINT : MOTION_EASE_IN_QUINT,
  };
}
