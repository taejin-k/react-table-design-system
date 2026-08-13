import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
} from "react";
import {
  calculateFloatingPosition,
  type FloatingPlacement,
  type FloatingPosition,
} from "./floating-position";

export type FloatingTrigger = "hover" | "focus" | "click";
export type FloatingOpenSource = "trigger" | "outside" | "escape" | "scroll" | "menu";

interface UseFloatingLayerOptions {
  enabled?: boolean;
  disabled?: boolean;
  placement: FloatingPlacement;
  trigger: FloatingTrigger | FloatingTrigger[];
  open?: boolean;
  defaultOpen?: boolean;
  autoAdjustOverflow?: boolean;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  targetGap?: number;
  closeOnScroll?: boolean;
  onOpenChange?: (open: boolean, source: FloatingOpenSource) => void;
}

export function useFloatingLayer({
  enabled = true,
  disabled = false,
  placement,
  trigger,
  open,
  defaultOpen = false,
  autoAdjustOverflow = true,
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  targetGap,
  closeOnScroll = true,
  onOpenChange,
}: UseFloatingLayerOptions) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [position, setPosition] = useState<FloatingPosition | null>(null);
  const triggers = useMemo(() => new Set(Array.isArray(trigger) ? trigger : [trigger]), [trigger]);
  const isOpen = enabled && !disabled && (open ?? innerOpen);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  }, []);

  const changeOpen = useCallback(
    (nextOpen: boolean, source: FloatingOpenSource = "trigger") => {
      if ((!enabled || disabled) && nextOpen) return;
      if (nextOpen === isOpen) return;
      if (open === undefined) setInnerOpen(nextOpen);
      onOpenChangeRef.current?.(nextOpen, source);
    },
    [disabled, enabled, isOpen, open],
  );

  const scheduleOpen = useCallback(() => {
    if (!enabled || disabled) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (mouseEnterDelay <= 0) return changeOpen(true);
    openTimerRef.current = setTimeout(() => changeOpen(true), mouseEnterDelay * 1000);
  }, [changeOpen, disabled, enabled, mouseEnterDelay]);

  const scheduleClose = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (mouseLeaveDelay <= 0) return changeOpen(false);
    closeTimerRef.current = setTimeout(() => changeOpen(false), mouseLeaveDelay * 1000);
  }, [changeOpen, mouseLeaveDelay]);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !popupRef.current) return;
    setPosition(
      calculateFloatingPosition(
        triggerRef.current.getBoundingClientRect(),
        popupRef.current.getBoundingClientRect(),
        placement,
        { autoAdjustOverflow, targetGap },
      ),
    );
  }, [autoAdjustOverflow, placement, targetGap]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    updatePosition();
    const handleScroll = (event: Event) => {
      if (event.target instanceof Node && popupRef.current?.contains(event.target)) return;
      if (!closeOnScroll) return updatePosition();
      clearTimers();
      changeOpen(false, "scroll");
    };
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updatePosition);
    if (triggerRef.current) resizeObserver?.observe(triggerRef.current);
    if (popupRef.current) resizeObserver?.observe(popupRef.current);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", handleScroll, true);
      resizeObserver?.disconnect();
    };
  }, [changeOpen, clearTimers, closeOnScroll, isOpen, updatePosition]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointerDown = (event: globalThis.PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (triggerRef.current?.contains(event.target) || popupRef.current?.contains(event.target))
        return;
      clearTimers();
      changeOpen(false, "outside");
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      clearTimers();
      changeOpen(false, "escape");
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [changeOpen, clearTimers, isOpen]);

  const triggerProps = {
    onBlur: ((event) => {
      if (triggers.has("focus") && !event.currentTarget.contains(event.relatedTarget))
        scheduleClose();
    }) satisfies FocusEventHandler<HTMLSpanElement>,
    onClick: (() => {
      if (!triggers.has("click")) return;
      clearTimers();
      changeOpen(!isOpen);
    }) satisfies MouseEventHandler<HTMLSpanElement>,
    onFocus: (() => {
      if (triggers.has("focus")) scheduleOpen();
    }) satisfies FocusEventHandler<HTMLSpanElement>,
    onPointerEnter: (() => {
      if (triggers.has("hover")) scheduleOpen();
    }) satisfies PointerEventHandler<HTMLSpanElement>,
    onPointerLeave: (() => {
      if (triggers.has("hover")) scheduleClose();
    }) satisfies PointerEventHandler<HTMLSpanElement>,
  };

  const popupProps = {
    onPointerEnter: (() => {
      if (!triggers.has("hover")) return;
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    }) satisfies PointerEventHandler<HTMLDivElement>,
    onPointerLeave: (() => {
      if (triggers.has("hover")) scheduleClose();
    }) satisfies PointerEventHandler<HTMLDivElement>,
  };

  return {
    triggerRef,
    popupRef,
    triggerProps,
    popupProps,
    isOpen,
    position,
    changeOpen,
    clearTimers,
    updatePosition,
  };
}
