import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import type { CalendarMode, CalendarProps } from "./Calendar.types";

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
function weekNumber(value: Date) {
  const date = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - start.getTime()) / 86400000 + 1) / 7);
}

export function Calendar({
  value,
  defaultValue,
  mode: modeProp,
  fullscreen = true,
  showWeek = false,
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
  const [innerValue, setInnerValue] = useState(defaultValue ?? new Date());
  const [innerMode, setInnerMode] = useState<CalendarMode>(modeProp ?? "month");
  const selected = value ?? innerValue;
  const mode = modeProp ?? innerMode;
  const [panel, setPanel] = useState(new Date(selected));
  const changePanel = (date: Date, nextMode = mode) => {
    setPanel(date);
    onPanelChange?.(date, nextMode);
  };
  const changeMode = (nextMode: CalendarMode) => {
    if (modeProp === undefined) setInnerMode(nextMode);
    onPanelChange?.(panel, nextMode);
  };
  const isDisabled = (date: Date) =>
    Boolean((validRange && (date < validRange[0] || date > validRange[1])) || disabledDate?.(date));
  const choose = (date: Date, source: "date" | "month" | "year") => {
    if (isDisabled(date)) return;
    if (value === undefined) setInnerValue(date);
    onChange?.(date);
    onSelect?.(date, { source });
    if (source !== "date") changePanel(date, source === "year" ? "month" : mode);
  };
  const defaultHeader = (
    <div className="flex flex-wrap items-center justify-end gap-2 border-b border-[#f0f0f0] p-3">
      <select
        aria-label="연도"
        value={panel.getFullYear()}
        className="h-8 rounded-md border border-[#d9d9d9] bg-white px-2"
        onChange={(event) => changePanel(new Date(Number(event.target.value), panel.getMonth(), 1))}
      >
        {Array.from({ length: 20 }, (_, index) => panel.getFullYear() - 10 + index).map((year) => (
          <option key={year}>{year}</option>
        ))}
      </select>
      {mode === "month" ? (
        <select
          aria-label="월"
          value={panel.getMonth()}
          className="h-8 rounded-md border border-[#d9d9d9] bg-white px-2"
          onChange={(event) =>
            changePanel(new Date(panel.getFullYear(), Number(event.target.value), 1))
          }
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
      ) : null}
      <div className="inline-flex overflow-hidden rounded-md border border-[#d9d9d9]">
        <button
          type="button"
          className={twMerge("h-8 px-3", mode === "month" && "bg-[#0062df] text-white")}
          onClick={() => changeMode("month")}
        >
          월
        </button>
        <button
          type="button"
          className={twMerge("h-8 px-3", mode === "year" && "bg-[#0062df] text-white")}
          onClick={() => changeMode("year")}
        >
          년
        </button>
      </div>
    </div>
  );
  const header =
    headerRender?.({ value: panel, type: mode, onChange: changePanel, onTypeChange: changeMode }) ??
    defaultHeader;
  return (
    <div
      className={twMerge(
        "overflow-hidden bg-white font-pretendard text-sm text-[#111]",
        fullscreen ? "w-full" : "w-72 rounded-lg border border-[#f0f0f0]",
        className,
      )}
      style={style}
    >
      {header}
      {mode === "year" ? (
        <div className="grid grid-cols-3 gap-2 p-3">
          {months.map((month, index) => {
            const date = new Date(panel.getFullYear(), index, 1);
            const origin = (
              <button
                type="button"
                disabled={isDisabled(date)}
                className={twMerge(
                  "h-16 rounded-md transition-colors hover:bg-[#e6f4ff] disabled:text-[#bbb]",
                  selected.getFullYear() === date.getFullYear() &&
                    selected.getMonth() === index &&
                    "bg-[#0062df] text-white hover:bg-[#0062df]",
                )}
                onClick={() => choose(date, "month")}
              >
                {month}
              </button>
            );
            const info = { originNode: origin, today: new Date(), type: mode } as const;
            return (
              <div key={month}>
                {fullCellRender?.(date, info) ?? cellRender?.(date, info) ?? origin}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-2">
          <div
            className={twMerge(
              "grid text-center text-[#666]",
              showWeek ? "grid-cols-8" : "grid-cols-7",
            )}
          >
            {showWeek ? <span className="py-2">주</span> : null}
            {weekdays.map((day) => (
              <span key={day} className="py-2">
                {day}
              </span>
            ))}
          </div>
          <div className={twMerge("grid", showWeek ? "grid-cols-8" : "grid-cols-7")}>
            {daysForMonth(panel).map((date, index) => {
              const disabled = isDisabled(date);
              const outside = date.getMonth() !== panel.getMonth();
              const origin = (
                <button
                  type="button"
                  disabled={disabled}
                  className={twMerge(
                    "relative flex w-full items-start justify-end rounded-md p-2 transition-colors hover:bg-[#e6f4ff] disabled:cursor-not-allowed disabled:text-[#bbb]",
                    fullscreen
                      ? "h-24 border-t border-[#f0f0f0]"
                      : "h-9 items-center justify-center p-0",
                    outside && "text-[#bbb]",
                    sameDate(date, new Date()) && "font-semibold text-[#0062df]",
                    sameDate(date, selected) &&
                      (fullscreen ? "bg-[#e6f4ff]" : "bg-[#0062df] text-white hover:bg-[#0062df]"),
                  )}
                  onClick={() => choose(date, "date")}
                >
                  {date.getDate()}
                </button>
              );
              const info = { originNode: origin, today: new Date(), type: mode } as const;
              return (
                <div key={date.toISOString()} className="contents">
                  {showWeek && index % 7 === 0 ? (
                    <span className="flex items-center justify-center border-t border-[#f0f0f0] text-xs text-[#999]">
                      {weekNumber(date)}
                    </span>
                  ) : null}
                  <div>{fullCellRender?.(date, info) ?? cellRender?.(date, info) ?? origin}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!fullscreen ? (
        <div className="flex justify-end border-t border-[#f0f0f0] p-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const today = new Date();
              setPanel(today);
              choose(today, "date");
            }}
          >
            오늘
          </Button>
        </div>
      ) : null}
    </div>
  );
}
