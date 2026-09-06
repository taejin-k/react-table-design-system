import type { ReactNode } from "react";

/** Preserve plain-text line breaks; opt into long-word wrapping without restyling custom JSX. */
export function MultilineText({ children, wrap = false }: { children: ReactNode; wrap?: boolean }) {
  return typeof children === "string" && (wrap || /[\r\n]/.test(children)) ? (
    <span
      className={
        wrap
          ? "max-w-full min-w-0 [overflow-wrap:anywhere] whitespace-pre-line"
          : "whitespace-pre-line"
      }
    >
      {children}
    </span>
  ) : (
    children
  );
}
