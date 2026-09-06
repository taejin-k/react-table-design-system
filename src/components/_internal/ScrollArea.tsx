import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type PointerEvent,
} from "react";
import { twMerge } from "tailwind-merge";

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
  contentClassName?: string;
  viewportMarker?: string;
  verticalOnly?: boolean;
}

type Axis = "x" | "y";
type AxisMetrics = { length: number; thumb: number; offset: number; maxScroll: number };
const emptyMetrics = (): AxisMetrics => ({ length: 0, thumb: 0, offset: 0, maxScroll: 0 });
const thumbClass =
  "absolute cursor-grab touch-none rounded-full bg-disabled transition-colors duration-200 ease-out hover:bg-disabled active:cursor-grabbing motion-reduce:transition-none";

/** Native scrolling with Table-style thumbs. Geometry changes never animate. */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      children,
      className,
      viewportClassName,
      contentClassName,
      viewportMarker,
      verticalOnly = false,
      ...rest
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const xTrackRef = useRef<HTMLDivElement>(null);
    const yTrackRef = useRef<HTMLDivElement>(null);
    const xThumbRef = useRef<HTMLDivElement>(null);
    const yThumbRef = useRef<HTMLDivElement>(null);
    const metrics = useRef({ x: emptyMetrics(), y: emptyMetrics() });
    const drag = useRef<{
      axis: Axis;
      pointerId: number;
      coordinate: number;
      scroll: number;
    } | null>(null);

    const measure = useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const hasX = !verticalOnly && viewport.scrollWidth > viewport.clientWidth + 1;
      const hasY = viewport.scrollHeight > viewport.clientHeight + 1;
      for (const axis of ["x", "y"] as const) {
        const horizontal = axis === "x";
        const track = horizontal ? xTrackRef.current : yTrackRef.current;
        const thumb = horizontal ? xThumbRef.current : yThumbRef.current;
        if (!track || !thumb) continue;
        const visible = horizontal ? hasX : hasY;
        track.style.display = visible ? "" : "none";
        if (horizontal) track.style.right = hasY ? "8px" : "0px";
        else track.style.bottom = hasX ? "8px" : "0px";
        const length = horizontal ? track.clientWidth : track.clientHeight;
        const viewportLength = horizontal ? viewport.clientWidth : viewport.clientHeight;
        const contentLength = horizontal ? viewport.scrollWidth : viewport.scrollHeight;
        const maxScroll = Math.max(0, contentLength - viewportLength);
        const thumbLength =
          contentLength > 0
            ? Math.min(length, Math.max(32, (length * viewportLength) / contentLength))
            : 0;
        const scroll = horizontal ? viewport.scrollLeft : viewport.scrollTop;
        const offset =
          maxScroll > 0 ? Math.max(0, Math.min(1, scroll / maxScroll)) * (length - thumbLength) : 0;
        metrics.current[axis] = { length, thumb: thumbLength, offset, maxScroll };
        thumb.style[horizontal ? "width" : "height"] = `${thumbLength}px`;
        thumb.style.transform = `translate${horizontal ? "X" : "Y"}(${offset}px)`;
      }
    }, [verticalOnly]);

    useLayoutEffect(measure);
    useLayoutEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const observer =
        typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
      observer?.observe(viewport);
      if (contentRef.current) observer?.observe(contentRef.current);
      viewport.addEventListener("scroll", measure, { passive: true });
      // Images and other replaced elements can grow the scrollable width without
      // changing the content wrapper's own border box.
      viewport.addEventListener("load", measure, true);
      const tracks = [xTrackRef.current, yTrackRef.current].filter(
        (track): track is HTMLDivElement => Boolean(track),
      );
      const wheel = (event: WheelEvent) => {
        if (event.ctrlKey) return;
        const x = viewport.scrollLeft;
        const y = viewport.scrollTop;
        const horizontal = event.currentTarget === xTrackRef.current;
        const unit =
          event.deltaMode === 1
            ? Number.parseFloat(getComputedStyle(viewport).lineHeight) || 22
            : event.deltaMode === 2
              ? horizontal
                ? viewport.clientWidth
                : viewport.clientHeight
              : 1;
        if (horizontal) viewport.scrollLeft += (event.deltaX || event.deltaY) * unit;
        else {
          viewport.scrollLeft += event.deltaX * unit;
          viewport.scrollTop += event.deltaY * unit;
        }
        if (viewport.scrollLeft !== x || viewport.scrollTop !== y) event.preventDefault();
        measure();
      };
      tracks.forEach((track) => track.addEventListener("wheel", wheel, { passive: false }));
      return () => {
        observer?.disconnect();
        viewport.removeEventListener("scroll", measure);
        viewport.removeEventListener("load", measure, true);
        tracks.forEach((track) => track.removeEventListener("wheel", wheel));
      };
    }, [measure]);

    const pointerDown = (event: PointerEvent<HTMLDivElement>, axis: Axis, isThumb: boolean) => {
      const viewport = viewportRef.current;
      if (!viewport || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      measure();
      const horizontal = axis === "x";
      const coordinate = horizontal ? event.clientX : event.clientY;
      const scrollKey = horizontal ? "scrollLeft" : "scrollTop";
      if (isThumb) {
        drag.current = {
          axis,
          pointerId: event.pointerId,
          coordinate,
          scroll: viewport[scrollKey],
        };
        event.currentTarget.setPointerCapture(event.pointerId);
      } else {
        const { length, thumb, maxScroll } = metrics.current[axis];
        const rect = event.currentTarget.getBoundingClientRect();
        const rectLength = horizontal ? rect.width : rect.height;
        const scale = rectLength > 0 ? length / rectLength : 1;
        const relative = (coordinate - (horizontal ? rect.left : rect.top)) * scale - thumb / 2;
        if (length > thumb)
          viewport[scrollKey] = Math.max(0, Math.min(1, relative / (length - thumb))) * maxScroll;
        measure();
      }
    };
    const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      const start = drag.current;
      if (!viewport || !start || event.pointerId !== start.pointerId) return;
      const { length, thumb, maxScroll } = metrics.current[start.axis];
      const horizontal = start.axis === "x";
      const track = horizontal ? xTrackRef.current : yTrackRef.current;
      const rect = track?.getBoundingClientRect();
      const rectLength = rect ? (horizontal ? rect.width : rect.height) : length;
      const scale = rectLength > 0 ? length / rectLength : 1;
      if (length <= thumb) return;
      viewport[horizontal ? "scrollLeft" : "scrollTop"] =
        start.scroll +
        ((((horizontal ? event.clientX : event.clientY) - start.coordinate) * scale) /
          (length - thumb)) *
          maxScroll;
      measure();
    };
    const pointerEnd = (event: PointerEvent<HTMLDivElement>) => {
      if (drag.current?.pointerId !== event.pointerId) return;
      drag.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId);
    };
    return (
      <div
        ref={ref}
        data-scroll-area
        className={twMerge(
          "relative grid min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]",
          className,
        )}
        {...rest}
      >
        <div
          ref={viewportRef}
          data-scroll-viewport
          {...(viewportMarker ? { [viewportMarker]: "" } : {})}
          className={twMerge(
            "wizard-scroll-viewport min-h-0 min-w-0 overflow-auto",
            verticalOnly && "overflow-x-hidden",
            viewportClassName,
          )}
        >
          <div ref={contentRef} className={twMerge("flow-root min-w-0", contentClassName)}>
            {children}
          </div>
        </div>
        {(["x", "y"] as const).map((axis) => (
          <div
            key={axis}
            ref={axis === "x" ? xTrackRef : yTrackRef}
            data-scroll-track={axis}
            className={twMerge(
              "pointer-events-auto absolute z-10 cursor-pointer touch-none",
              axis === "x" ? "right-0 bottom-0 left-0 h-2" : "top-0 right-0 bottom-0 w-2",
            )}
            style={{ display: "none" }}
            onPointerDown={(event) => pointerDown(event, axis, false)}
          >
            <div
              ref={axis === "x" ? xThumbRef : yThumbRef}
              data-scroll-thumb={axis}
              className={twMerge(
                thumbClass,
                axis === "x" ? "top-px left-0 h-1.5" : "top-0 right-px w-1.5",
              )}
              onPointerDown={(event) => pointerDown(event, axis, true)}
              onPointerMove={pointerMove}
              onPointerUp={pointerEnd}
              onPointerCancel={pointerEnd}
              onLostPointerCapture={pointerEnd}
            />
          </div>
        ))}
      </div>
    );
  },
);
ScrollArea.displayName = "ScrollArea";
