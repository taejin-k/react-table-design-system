import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { useExpandMotion } from "./use-expand-motion";

type ExpandedRowProps = {
  expanded: boolean;
  colSpan: number;
  cellClassName: string;
  paddingClassName: string;
  renderContent: () => ReactNode;
};

export function ExpandedRow({
  expanded,
  colSpan,
  cellClassName,
  paddingClassName,
  renderContent,
}: ExpandedRowProps) {
  const { rendered, visible, onTransitionEnd } = useExpandMotion(expanded);

  if (!rendered) return null;

  return (
    <tr className="bg-hover" data-table-expanded-row>
      <td className={twMerge(cellClassName, "border-b-0 !bg-hover p-0")} colSpan={colSpan}>
        <div
          data-table-expand-motion
          className="grid grid-cols-[minmax(0,1fr)] transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
          style={{ gridTemplateRows: visible ? "1fr" : "0fr" }}
          onTransitionEnd={onTransitionEnd}
        >
          <div className="min-h-0 min-w-0 overflow-clip">
            <div
              data-table-expanded-content
              className={twMerge("border-b border-hover", paddingClassName)}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}
