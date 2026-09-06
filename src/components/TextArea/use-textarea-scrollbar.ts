import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type PointerEvent,
} from "react";

/** Keep native textarea scrolling/resizing; draw only the thumb as an animatable element. */
export function useTextAreaScrollbar(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  resizable: boolean,
) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; y: number; scrollTop: number } | null>(null);
  const bottom = resizable ? 14 : 4;
  const [metrics, setMetrics] = useState({ height: 0, thumbHeight: 0, top: 0 });
  const measure = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const height = Math.max(0, textarea.clientHeight - 4 - bottom);
    const maxScroll = textarea.scrollHeight - textarea.clientHeight;
    const thumbHeight =
      maxScroll > 0
        ? Math.min(height, Math.max(32, (height * textarea.clientHeight) / textarea.scrollHeight))
        : 0;
    const top =
      maxScroll > 0
        ? Math.max(0, Math.min(1, textarea.scrollTop / maxScroll)) * (height - thumbHeight)
        : 0;
    setMetrics((previous) =>
      previous.height === height && previous.thumbHeight === thumbHeight && previous.top === top
        ? previous
        : { height, thumbHeight, top },
    );
  }, [textareaRef, bottom]);

  // Runs after autoSize so typing and controlled value changes use the new height.
  useLayoutEffect(measure, [measure, value]);
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const observer =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(textarea);
    textarea.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer?.disconnect();
      textarea.removeEventListener("scroll", measure);
    };
  }, [measure, textareaRef]);

  const visible = metrics.thumbHeight > 0;
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const wheel = (event: WheelEvent) => {
      const textarea = textareaRef.current;
      if (!textarea || event.ctrlKey) return;
      const previousTop = textarea.scrollTop;
      const unit =
        event.deltaMode === 1
          ? Number.parseFloat(getComputedStyle(textarea).lineHeight) || 22
          : event.deltaMode === 2
            ? textarea.clientHeight
            : 1;
      textarea.scrollTop += event.deltaY * unit;
      if (textarea.scrollTop !== previousTop) event.preventDefault();
      measure();
    };
    track.addEventListener("wheel", wheel, { passive: false });
    return () => track.removeEventListener("wheel", wheel);
  }, [measure, textareaRef, visible]);

  const onTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const textarea = textareaRef.current;
    if (!textarea || event.button !== 0 || event.target !== event.currentTarget) return;
    event.preventDefault();
    const travel = metrics.height - metrics.thumbHeight;
    if (travel <= 0) return;
    const y =
      event.clientY - event.currentTarget.getBoundingClientRect().top - metrics.thumbHeight / 2;
    textarea.scrollTop =
      Math.max(0, Math.min(1, y / travel)) * (textarea.scrollHeight - textarea.clientHeight);
    measure();
  };
  const onThumbPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const textarea = textareaRef.current;
    if (!textarea || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current = { pointerId: event.pointerId, y: event.clientY, scrollTop: textarea.scrollTop };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onThumbPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const textarea = textareaRef.current;
    const start = drag.current;
    const travel = metrics.height - metrics.thumbHeight;
    if (!textarea || !start || start.pointerId !== event.pointerId || travel <= 0) return;
    textarea.scrollTop =
      start.scrollTop +
      ((event.clientY - start.y) / travel) * (textarea.scrollHeight - textarea.clientHeight);
    measure();
  };
  const onThumbPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return {
    ...metrics,
    visible,
    bottom,
    trackRef,
    onTrackPointerDown,
    onThumbPointerDown,
    onThumbPointerMove,
    onThumbPointerEnd,
  };
}
