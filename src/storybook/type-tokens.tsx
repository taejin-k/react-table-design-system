import type { ReactNode } from "react";

export function TypeTokens({ values }: { values: readonly ReactNode[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value, index) => (
        <code
          key={`${String(value)}-${index}`}
          className="rounded-full border border-[#e3e8ef] bg-[#f8fafc] px-3 py-1.5 text-[13px] text-[#4a5667]"
        >
          {value}
        </code>
      ))}
    </div>
  );
}
