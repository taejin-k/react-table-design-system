let lockCount = 0;
let previousOverflow = "";
let previousWidth = "";
let removeResizeListener: (() => void) | undefined;

export function lockBodyScroll() {
  if (typeof document === "undefined") return () => undefined;

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    previousWidth = document.body.style.width;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);

    // Keep the body's measured pre-lock width instead of adding padding. Using `calc(100% - x)`
    // double-subtracts the gutter when the document already uses `scrollbar-gutter: stable`.
    if (scrollbarWidth > 0) {
      const layoutWidth = document.documentElement.clientWidth;
      const bodyWidth = document.body.getBoundingClientRect().width;
      const bodyWidthRatio = layoutWidth > 0 ? bodyWidth / layoutWidth : 1;
      const preserveBodyWidth = () => {
        document.body.style.width = `${Math.max(0, window.innerWidth - scrollbarWidth) * bodyWidthRatio}px`;
      };

      preserveBodyWidth();
      window.addEventListener("resize", preserveBodyWidth);
      removeResizeListener = () => window.removeEventListener("resize", preserveBodyWidth);
    }
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      removeResizeListener?.();
      removeResizeListener = undefined;
      document.body.style.overflow = previousOverflow;
      document.body.style.width = previousWidth;
    }
  };
}
