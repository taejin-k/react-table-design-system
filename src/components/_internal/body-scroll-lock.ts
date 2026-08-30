let lockCount = 0;
let previousOverflow = "";
let previousPaddingRight = "";
let previousDocumentScrollbarGutter = "";
let previousBodyScrollbarGutter = "";
let previousScrollbarCompensation = "";

export function lockBodyScroll() {
  if (typeof document === "undefined") return () => undefined;

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;
    previousDocumentScrollbarGutter = document.documentElement.style.scrollbarGutter;
    previousBodyScrollbarGutter = document.body.style.scrollbarGutter;
    previousScrollbarCompensation = document.documentElement.style.getPropertyValue(
      "--wizard-scrollbar-compensation",
    );
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.style.setProperty(
      "--wizard-scrollbar-compensation",
      `${scrollbarWidth}px`,
    );

    // Keep the content width without narrowing the body itself. A narrowed body also limits fixed
    // overlay roots and exposes the removed scrollbar area as a white strip.
    if (scrollbarWidth > 0) {
      const currentPaddingRight =
        Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      document.documentElement.style.scrollbarGutter = "auto";
      document.body.style.scrollbarGutter = "auto";
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
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
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.documentElement.style.scrollbarGutter = previousDocumentScrollbarGutter;
      document.body.style.scrollbarGutter = previousBodyScrollbarGutter;
      if (previousScrollbarCompensation) {
        document.documentElement.style.setProperty(
          "--wizard-scrollbar-compensation",
          previousScrollbarCompensation,
        );
      } else {
        document.documentElement.style.removeProperty("--wizard-scrollbar-compensation");
      }
    }
  };
}
