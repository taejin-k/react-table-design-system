import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { twMerge } from "tailwind-merge";

interface ScrollFadeProps extends HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
  fadeSize?: number;
}

export const ScrollFade = forwardRef<HTMLDivElement, ScrollFadeProps>(
  (
    { children, className, viewportClassName, fadeSize = 24, onScroll, style, ...rest },
    forwardedRef,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [edge, setEdge] = useState({ top: false, bottom: false });

    useImperativeHandle(forwardedRef, () => viewportRef.current as HTMLDivElement);

    const updateEdge = useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const next = {
        top: viewport.scrollTop > 1,
        bottom: viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1,
      };
      setEdge((current) =>
        current.top === next.top && current.bottom === next.bottom ? current : next,
      );
    }, []);

    useLayoutEffect(() => {
      updateEdge();
      const viewport = viewportRef.current;
      if (!viewport || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(updateEdge);
      observer.observe(viewport);
      if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
      return () => observer.disconnect();
    }, [children, updateEdge]);

    return (
      <div className={twMerge("relative min-h-0", className)} style={style}>
        <div
          ref={viewportRef}
          className={twMerge(
            "wizard-scrollbar-hidden h-full max-h-[inherit] overflow-auto",
            viewportClassName,
          )}
          onScroll={(event) => {
            updateEdge();
            onScroll?.(event);
          }}
          {...rest}
        >
          {children}
        </div>
        <div
          className={twMerge(
            "pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-white to-transparent transition-opacity",
            edge.top ? "opacity-100" : "opacity-0",
          )}
          style={{ height: fadeSize }}
        />
        <div
          className={twMerge(
            "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent transition-opacity",
            edge.bottom ? "opacity-100" : "opacity-0",
          )}
          style={{ height: fadeSize }}
        />
      </div>
    );
  },
);

ScrollFade.displayName = "ScrollFade";
