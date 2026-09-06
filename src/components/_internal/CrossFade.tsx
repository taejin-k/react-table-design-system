import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function CrossFade({
  transitionKey,
  children,
  className,
}: {
  transitionKey: string;
  children: ReactNode;
  className?: string;
}) {
  const previousKeyRef = useRef(transitionKey);
  const previousContentRef = useRef(children);
  const frameRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<number | undefined>(undefined);
  const [outgoing, setOutgoing] = useState<ReactNode>(null);
  const [entered, setEntered] = useState(true);
  const nextContentRef = useRef(children);
  nextContentRef.current = children;
  if (previousKeyRef.current === transitionKey) previousContentRef.current = children;

  useLayoutEffect(() => {
    if (previousKeyRef.current === transitionKey) return;

    window.cancelAnimationFrame(frameRef.current ?? 0);
    window.clearTimeout(timerRef.current);
    setOutgoing(previousContentRef.current);
    setEntered(false);
    previousKeyRef.current = transitionKey;
    previousContentRef.current = nextContentRef.current;
    frameRef.current = window.requestAnimationFrame(() => setEntered(true));
    timerRef.current = window.setTimeout(() => setOutgoing(null), 200);

    return () => {
      window.cancelAnimationFrame(frameRef.current ?? 0);
      window.clearTimeout(timerRef.current);
    };
  }, [transitionKey]);

  return (
    <span className={twMerge("relative inline-flex shrink-0", className)}>
      {outgoing ? (
        <span
          className={twMerge(
            "absolute inset-0 inline-flex items-center justify-center transition-opacity duration-200 ease-out motion-reduce:transition-none",
            entered ? "opacity-0" : "opacity-100",
          )}
        >
          {outgoing}
        </span>
      ) : null}
      <span
        className={twMerge(
          "inline-flex items-center justify-center transition-opacity duration-200 ease-out motion-reduce:transition-none",
          entered ? "opacity-100" : "opacity-0",
        )}
      >
        {children}
      </span>
    </span>
  );
}
