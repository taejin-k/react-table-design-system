import { useEffect, useState, type ReactNode, type TdHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { MOTION_DURATION_MID } from "../_internal/motion";
import type { Key } from "./Table.types";
import { useExpandMotion } from "./use-expand-motion";

const sameKeys = (left: Set<Key>, right: Set<Key>) =>
  left.size === right.size && Array.from(left).every((key) => right.has(key));

// Keep closed branches in the row list until their exit animation has finished.
export function useRetainedExpandedKeys(expanded: Set<Key>) {
  const [state, setState] = useState({ current: expanded, retained: expanded });
  if (!sameKeys(state.current, expanded)) {
    setState({ current: expanded, retained: new Set([...state.retained, ...expanded]) });
  }
  useEffect(() => {
    if (sameKeys(state.current, state.retained)) return;
    const timer = setTimeout(() => {
      setState((current) => ({ ...current, retained: current.current }));
    }, MOTION_DURATION_MID + 50);
    return () => clearTimeout(timer);
  }, [state]);
  return state.retained;
}

export function TreeRowMotion({
  expanded,
  children,
}: {
  expanded: boolean;
  children: (visible: boolean) => ReactNode;
}) {
  const motion = useExpandMotion(expanded, true);
  return motion.rendered ? children(motion.visible) : null;
}

export function TreeMotionCell({
  motionVisible,
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { motionVisible?: boolean }) {
  if (motionVisible === undefined)
    return (
      <td {...props} className={className}>
        {children}
      </td>
    );
  return (
    <td
      {...props}
      className={twMerge(
        className,
        "transition-[background-color,padding-top,padding-bottom,border-bottom-width] duration-200 ease-out motion-reduce:transition-none",
        !motionVisible && "!border-b-0 !py-0",
      )}
    >
      <div
        data-table-tree-motion
        className="grid grid-cols-[minmax(0,1fr)] transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: motionVisible ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 min-w-0 overflow-clip">{children}</div>
      </div>
    </td>
  );
}
