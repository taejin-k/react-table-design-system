import { flushSync } from "react-dom";

export function observeFloatingResize(updatePosition: () => void) {
  if (typeof ResizeObserver === "undefined") return null;
  return new ResizeObserver(() => {
    // Resize delivery runs after layout, just before paint. Commit coordinates
    // now so resized content is never painted at the previous size's position.
    flushSync(updatePosition);
  });
}
