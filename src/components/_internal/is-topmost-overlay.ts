const overlaySelector = "[data-modal-root], [data-drawer-root], [data-image-preview-root]";

/** Keyboard actions belong to the visible overlay painted above the others. */
export function isTopmostOverlay(element: HTMLElement | null) {
  const root = element?.closest<HTMLElement>(overlaySelector);
  if (!root) return false;
  let topmost: HTMLElement | undefined;
  let highestZIndex = -Infinity;
  for (const candidate of Array.from(
    root.ownerDocument.querySelectorAll<HTMLElement>(overlaySelector),
  )) {
    const style = getComputedStyle(candidate);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const zIndex = Number(style.zIndex) || 0;
    // Equal z-index follows DOM paint order.
    if (zIndex >= highestZIndex) {
      highestZIndex = zIndex;
      topmost = candidate;
    }
  }
  return topmost === root;
}
