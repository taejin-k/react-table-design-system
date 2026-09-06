import { useCallback, useLayoutEffect, useRef, useState } from "react";

const EDGE_GAP = 8;

export function useBadgeContentOverflow(enabled: boolean) {
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  const measure = useCallback(() => {
    const indicator = indicatorRef.current;
    const content = contentRef.current;
    if (!enabled || !indicator || !content) {
      indicator?.style.removeProperty("--badge-available-width");
      setTruncated(false);
      return;
    }

    const bounds = indicator.getBoundingClientRect();
    if (!bounds.height) return;
    // Convert viewport coordinates back to local CSS pixels, including CSS zoom.
    const scale = indicator.offsetHeight ? bounds.height / indicator.offsetHeight : 1;
    const viewport = window.visualViewport;
    let right = document.documentElement.clientWidth || window.innerWidth;
    if (viewport) right = Math.min(right, viewport.offsetLeft + viewport.width);

    for (let parent = indicator.parentElement; parent; parent = parent.parentElement) {
      if (!/^(auto|scroll|hidden|clip)$/.test(getComputedStyle(parent).overflowX)) continue;
      const parentBounds = parent.getBoundingClientRect();
      if (!parentBounds.width || !parent.offsetWidth) continue;
      const parentScale = parentBounds.width / parent.offsetWidth;
      right = Math.min(
        right,
        parentBounds.left + (parent.clientLeft + parent.clientWidth) * parentScale,
      );
    }

    const available = Math.max(0, (right - EDGE_GAP - bounds.left) / scale);
    const width = `${available}px`;
    if (indicator.style.getPropertyValue("--badge-available-width") !== width) {
      // Write before paint without adding a React render for every scroll/resize.
      indicator.style.setProperty("--badge-available-width", width);
    }
    setTruncated(content.scrollWidth > content.clientWidth + 1);
  }, [enabled]);

  useLayoutEffect(measure);

  useLayoutEffect(() => {
    if (!enabled) return;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    // Ancestors can move the anchor when a surrounding layout is resized.
    for (let node: HTMLElement | null = indicatorRef.current; node; node = node.parentElement) {
      observer?.observe(node);
    }
    if (contentRef.current) observer?.observe(contentRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { capture: true, passive: true });
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", measure);
    viewport?.addEventListener("scroll", measure);
    document.fonts?.addEventListener("loadingdone", measure);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      viewport?.removeEventListener("resize", measure);
      viewport?.removeEventListener("scroll", measure);
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [enabled, measure]);

  return { indicatorRef, contentRef, truncated };
}
