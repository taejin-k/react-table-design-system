import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Select } from "../Select";
import type { CalendarProps } from "./Calendar.types";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const months = Array.from({ length: 12 }, (_, index) => `${index + 1}월`);
function sameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function daysForMonth(value: Date) {
  const first = new Date(value.getFullYear(), value.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}
export function Calendar({
  value,
  defaultValue,
  fullscreen = true,
  validRange,
  disabledDate,
  cellRender,
  fullCellRender,
  headerRender,
  className,
  onChange,
  onPanelChange,
  onSelect,
}: CalendarProps) {
  const today = new Date();
  const [innerValue, setInnerValue] = useState(defaultValue ?? new Date());
  const selected = value ?? innerValue;
  const [panel, setPanel] = useState(new Date(selected));
  useEffect(() => {
    if (value) setPanel(new Date(value));
  }, [value]);
  const changePanel = (date: Date) => {
    setPanel(date);
    onPanelChange?.(date);
  };
  const isDisabled = (date: Date) =>
    Boolean((validRange && (date < validRange[0] || date > validRange[1])) || disabledDate?.(date));
  const choose = (date: Date) => {
    if (isDisabled(date)) return;
    if (value === undefined) setInnerValue(date);
    if (!sameDate(date, selected)) onChange?.(date);
    onSelect?.(date, { source: "date" });
    if (date.getMonth() !== panel.getMonth()) changePanel(date);
  };
  const defaultHeader = (
    <div className="flex flex-wrap items-center justify-end px-2 py-2 max-[480px]:grid max-[480px]:grid-cols-2 max-[480px]:gap-2">
      <Select
        value={panel.getFullYear()}
        size="md"
        width={80}
        options={Array.from({ length: 20 }, (_, index) => panel.getFullYear() - 10 + index).map(
          (year) => ({ label: String(year), value: year }),
        )}
        onChange={(nextYear) => changePanel(new Date(Number(nextYear), panel.getMonth(), 1))}
      />
      <Select
        value={panel.getMonth()}
        size="md"
        width={70}
        className="ml-2 max-[480px]:ml-0"
        options={months.map((month, index) => ({ label: month, value: index }))}
        onChange={(nextMonth) => changePanel(new Date(panel.getFullYear(), Number(nextMonth), 1))}
      />
    </div>
  );
  const header = headerRender?.({ value: panel, onChange: changePanel }) ?? defaultHeader;
  return (
    <div
      className={twMerge(
        "bg-white font-pretendard text-sm text-[#111]",
        fullscreen ? "w-full" : "w-[300px] rounded-lg",
        className,
      )}
    >
      {header}
      <div className={fullscreen ? "py-2" : "p-2"}>
        <div
          className={twMerge(
            "grid grid-cols-7",
            fullscreen ? "text-right text-[#666]" : "text-center",
          )}
        >
          {weekdays.map((day) => (
            <span key={day} className={fullscreen ? "h-6 pr-3" : "py-1 text-xs text-[#999]"}>
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {daysForMonth(panel).map((date) => {
            const disabled = isDisabled(date);
            const outside = date.getMonth() !== panel.getMonth();
            const origin = (
              <button
                type="button"
                disabled={disabled}
                className={twMerge(
                  "relative flex w-full cursor-pointer transition-colors duration-300 disabled:cursor-not-allowed disabled:text-[#bbb] motion-reduce:transition-none",
                  fullscreen
                    ? "mx-1 h-[90px] w-[calc(100%-8px)] items-start justify-end border-t-2 border-[#f0f0f0] px-2 pt-1 hover:bg-[#e6f4ff]"
                    : "size-8 items-center justify-center rounded p-0 hover:bg-[#f5f5f5]",
                  outside && "text-[#bbb]",
                  fullscreen && sameDate(date, today) && "border-t-[#0062df]",
                  sameDate(date, selected) &&
                    (fullscreen
                      ? "bg-[#e6f4ff]"
                      : "bg-[#e6f4ff] text-[#0062df] hover:bg-[#e6f4ff]"),
                  !fullscreen &&
                    disabled &&
                    "bg-transparent text-[#bfbfbf] hover:bg-transparent [&_*]:text-[#bfbfbf]!",
                )}
                onClick={() => choose(date)}
              >
                <span className={twMerge(!fullscreen && "inline-flex items-center justify-center")}>
                  {fullscreen ? String(date.getDate()).padStart(2, "0") : date.getDate()}
                </span>
              </button>
            );
            const info = { originNode: origin, today: new Date() } as const;
            return (
              <div key={date.toISOString()} className="contents">
                <div
                  className={twMerge(
                    !fullscreen && "relative my-0.5 flex h-8 items-center justify-center",
                    !fullscreen && disabled && "bg-[#f5f5f5]",
                  )}
                >
                  {fullCellRender?.(date, info) ?? cellRender?.(date, info) ?? origin}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
