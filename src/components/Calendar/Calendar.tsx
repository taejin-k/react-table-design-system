import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Select } from "../Select";
import type { CalendarModeType, CalendarProps } from "./Calendar.types";

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
  mode: modeProp,
  fullscreen = true,
  validRange,
  disabledDate,
  cellRender,
  fullCellRender,
  headerRender,
  className,
  style,
  onChange,
  onPanelChange,
  onSelect,
}: CalendarProps) {
  const today = new Date();
  const [innerValue, setInnerValue] = useState(defaultValue ?? new Date());
  const [innerMode, setInnerMode] = useState<CalendarModeType>(modeProp ?? "month");
  const selected = value ?? innerValue;
  const mode = modeProp ?? innerMode;
  const [panel, setPanel] = useState(new Date(selected));
  useEffect(() => {
    if (value) setPanel(new Date(value));
  }, [value]);
  const changePanel = (date: Date, nextMode = mode) => {
    setPanel(date);
    onPanelChange?.(date, nextMode);
  };
  const changeMode = (nextMode: CalendarModeType) => {
    if (modeProp === undefined) setInnerMode(nextMode);
    onPanelChange?.(panel, nextMode);
  };
  const isDisabled = (date: Date) =>
    Boolean((validRange && (date < validRange[0] || date > validRange[1])) || disabledDate?.(date));
  const choose = (date: Date, source: "date" | "month" | "year") => {
    if (isDisabled(date)) return;
    if (value === undefined) setInnerValue(date);
    if (!sameDate(date, selected)) onChange?.(date);
    onSelect?.(date, { source });
    if (source === "date" && date.getMonth() !== panel.getMonth()) changePanel(date, mode);
    if (source !== "date") changePanel(date, source === "year" ? "month" : mode);
  };
  const defaultHeader = (
    <div className="flex flex-wrap items-center justify-end py-2 max-[480px]:grid max-[480px]:grid-cols-2 max-[480px]:gap-2">
      <Select
        value={panel.getFullYear()}
        size="md"
        width={80}
        options={Array.from({ length: 20 }, (_, index) => panel.getFullYear() - 10 + index).map(
          (year) => ({ label: String(year), value: year }),
        )}
        onChange={(nextYear) => changePanel(new Date(Number(nextYear), panel.getMonth(), 1))}
      />
      {mode === "month" ? (
        <Select
          value={panel.getMonth()}
          size="md"
          width={70}
          className="ml-2 max-[480px]:ml-0"
          options={months.map((month, index) => ({ label: month, value: index }))}
          onChange={(nextMonth) => changePanel(new Date(panel.getFullYear(), Number(nextMonth), 1))}
        />
      ) : null}
      <div className="ml-2 inline-flex max-[480px]:col-span-2 max-[480px]:ml-0 max-[480px]:w-full">
        <Button
          size="sm"
          variant="ghost"
          className={twMerge(
            "h-8 min-w-[42px] flex-1 rounded-none rounded-l-md border border-[#d9d9d9] px-3 font-normal ring-0",
            mode === "month" &&
              "relative z-[1] border-[#0062df] bg-[#0062df] text-white hover:bg-[#0062df] hover:text-white",
          )}
          onClick={() => changeMode("month")}
        >
          월
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={twMerge(
            "-ml-px h-8 min-w-[42px] flex-1 rounded-none rounded-r-md border border-[#d9d9d9] px-3 font-normal ring-0",
            mode === "year" &&
              "relative z-[1] border-[#0062df] bg-[#0062df] text-white hover:bg-[#0062df] hover:text-white",
          )}
          onClick={() => changeMode("year")}
        >
          년
        </Button>
      </div>
    </div>
  );
  const header =
    headerRender?.({ value: panel, type: mode, onChange: changePanel, onTypeChange: changeMode }) ??
    defaultHeader;
  return (
    <div
      className={twMerge(
        "bg-white font-pretendard text-sm text-[#111]",
        fullscreen ? "w-full" : "w-[300px] rounded-lg",
        className,
      )}
      style={style}
    >
      {header}
      <div>
        {mode === "year" ? (
          <div className={twMerge("grid grid-cols-3", fullscreen ? "py-2" : "gap-y-2 p-2")}>
            {months.map((month, index) => {
              const date = new Date(panel.getFullYear(), index, 1);
              const isSelectedMonth =
                selected.getFullYear() === date.getFullYear() && selected.getMonth() === index;
              const origin = (
                <button
                  type="button"
                  disabled={isDisabled(date)}
                  className={twMerge(
                    "flex w-full cursor-pointer transition-colors duration-300 hover:bg-[#e6f4ff] disabled:cursor-not-allowed disabled:text-[#bbb] motion-reduce:transition-none",
                    fullscreen
                      ? "mx-1 h-[90px] w-[calc(100%-8px)] items-start justify-end border-t-2 border-[#f0f0f0] px-2 pt-1"
                      : "h-9 items-center justify-center rounded-md",
                    isSelectedMonth &&
                      (fullscreen
                        ? "bg-[#e6f4ff] text-[#0062df]"
                        : "bg-[#0062df] text-white hover:bg-[#0062df]"),
                  )}
                  onClick={() => choose(date, "month")}
                >
                  {month}
                </button>
              );
              const info = { originNode: origin, today: new Date(), type: mode } as const;
              return (
                <div key={month} className={fullscreen ? "min-w-0" : undefined}>
                  {fullCellRender?.(date, info) ?? cellRender?.(date, info) ?? origin}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={fullscreen ? "py-2" : "p-2"}>
            <div
              className={twMerge(
                "grid grid-cols-7 text-[#666]",
                fullscreen ? "text-right" : "text-center",
              )}
            >
              {weekdays.map((day) => (
                <span key={day} className={fullscreen ? "h-6 pr-3" : "py-1.5"}>
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
                        : "h-9 items-center justify-center p-0",
                      outside && "text-[#bbb]",
                      fullscreen && sameDate(date, today) && "border-t-[#0062df]",
                      sameDate(date, selected) &&
                        (fullscreen
                          ? "bg-[#e6f4ff]"
                          : "bg-[#0062df] text-white hover:bg-[#0062df]"),
                    )}
                    onClick={() => choose(date, "date")}
                  >
                    <span
                      className={twMerge(
                        !fullscreen &&
                          "inline-flex size-6 items-center justify-center rounded-md transition-colors duration-300",
                        !fullscreen && sameDate(date, today) && "text-[#0062df]",
                        !fullscreen && sameDate(date, selected) && "bg-[#0062df] text-white",
                      )}
                    >
                      {fullscreen ? String(date.getDate()).padStart(2, "0") : date.getDate()}
                    </span>
                  </button>
                );
                const info = { originNode: origin, today: new Date(), type: mode } as const;
                return (
                  <div key={date.toISOString()} className="contents">
                    <div>{fullCellRender?.(date, info) ?? cellRender?.(date, info) ?? origin}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
