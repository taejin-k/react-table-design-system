import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { Select } from "../Select";
import type { CalendarEvent, CalendarProps } from "./Calendar.types";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const months = Array.from({ length: 12 }, (_, index) => `${index + 1}월`);
const emptyCalendarEvents: CalendarEvent[] = [];
function parseDate(value?: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const normalizedValue = dayjs.isDayjs(value) ? value : dayjs(value as string | Date);
  return normalizedValue.isValid() ? normalizedValue.startOf("day").toDate() : null;
}
function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
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

interface CalendarEventSegment {
  event: CalendarEvent;
  startIndex: number;
  endIndex: number;
  lane: number;
}

function eventSegmentsForWeek(days: Date[], events: CalendarEvent[]): CalendarEventSegment[] {
  const weekStart = days[0];
  const weekEnd = days[days.length - 1];
  if (!weekStart || !weekEnd) return [];

  const segments = events
    .map((event) => {
      const start = parseDate(event.start);
      const end = parseDate(event.end ?? event.start);
      if (!start || !end || end < start || end < weekStart || start > weekEnd) return null;
      const visibleStart = start < weekStart ? weekStart : start;
      const visibleEnd = end > weekEnd ? weekEnd : end;
      return {
        event,
        startIndex: days.findIndex((date) => sameDate(date, visibleStart)),
        endIndex: days.findIndex((date) => sameDate(date, visibleEnd)),
      };
    })
    .filter((segment): segment is Omit<CalendarEventSegment, "lane"> => segment !== null)
    .sort(
      (a, b) =>
        a.startIndex - b.startIndex || b.endIndex - b.startIndex - (a.endIndex - a.startIndex),
    );

  const laneEnds: number[] = [];
  return segments.map((segment) => {
    let lane = laneEnds.findIndex((endIndex) => endIndex < segment.startIndex);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = segment.endIndex;
    return { ...segment, lane };
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
  events = emptyCalendarEvents,
  className,
  onChange,
  onPanelChange,
  onSelect,
  onEventClick,
}: CalendarProps) {
  const today = new Date();
  const [innerValue, setInnerValue] = useState(() => parseDate(defaultValue) ?? new Date());
  const selected = parseDate(value) ?? innerValue;
  const [panel, setPanel] = useState(() => new Date(selected));
  const rangeStart = parseDate(validRange?.[0]);
  const rangeEnd = parseDate(validRange?.[1]);
  const calendarDays = daysForMonth(panel);
  const weeks = Array.from({ length: 6 }, (_, index) =>
    calendarDays.slice(index * 7, index * 7 + 7),
  );
  useEffect(() => {
    const nextValue = parseDate(value);
    if (nextValue) setPanel(nextValue);
  }, [value]);
  const changePanel = (date: Date) => {
    setPanel(date);
    onPanelChange?.(dayjs(date));
  };
  const isDisabled = (date: Date) =>
    Boolean(
      (rangeStart && date < rangeStart) ||
      (rangeEnd && date > rangeEnd) ||
      disabledDate?.(dayjs(date)),
    );
  const choose = (date: Date) => {
    if (isDisabled(date)) return;
    if (value === undefined) setInnerValue(date);
    const nextValue = dayjs(date);
    if (!sameDate(date, selected)) onChange?.(nextValue);
    onSelect?.(nextValue);
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
  const header =
    headerRender?.({
      value: dayjs(panel),
      onChange: (nextValue) => {
        const nextDate = parseDate(nextValue);
        if (nextDate) changePanel(nextDate);
      },
    }) ?? defaultHeader;
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
        <div>
          {weeks.map((week) => {
            const weekKey = formatDate(week[0]!);
            const eventSegments = fullscreen ? eventSegmentsForWeek(week, events) : [];
            return (
              <div key={weekKey} className="relative grid grid-cols-7">
                {week.map((date) => {
                  const disabled = isDisabled(date);
                  const outside = date.getMonth() !== panel.getMonth();
                  const origin = (
                    <button
                      type="button"
                      disabled={disabled}
                      className={twMerge(
                        "relative flex w-full cursor-pointer transition-colors duration-300 disabled:cursor-not-allowed disabled:text-[#bbb] motion-reduce:transition-none",
                        fullscreen
                          ? "mx-1 h-[90px] w-[calc(100%-8px)] items-start justify-end border-t-2 border-[#f0f0f0] px-2 pt-1 hover:bg-[#f5f5f5]"
                          : "size-8 items-center justify-center rounded p-0 hover:bg-[#f5f5f5]",
                        outside && "text-[#bbb]",
                        fullscreen && sameDate(date, today) && "border-t-primary",
                        sameDate(date, selected) &&
                          (fullscreen
                            ? "bg-selected hover:bg-selected"
                            : "bg-selected text-primary hover:bg-selected"),
                        fullscreen &&
                          disabled &&
                          (sameDate(date, selected) ? "hover:bg-selected" : "hover:bg-transparent"),
                        !fullscreen &&
                          disabled &&
                          "bg-transparent text-[#bfbfbf] hover:bg-transparent [&_*]:text-[#bfbfbf]!",
                      )}
                      onClick={() => choose(date)}
                    >
                      <span
                        className={twMerge(
                          !fullscreen && "inline-flex items-center justify-center",
                        )}
                      >
                        {fullscreen ? String(date.getDate()).padStart(2, "0") : date.getDate()}
                      </span>
                    </button>
                  );
                  const info = { originNode: origin, today: dayjs(today) } as const;
                  return (
                    <div
                      key={date.toISOString()}
                      className={twMerge(
                        !fullscreen && "relative my-0.5 flex h-8 items-center justify-center",
                        !fullscreen && disabled && "bg-[#f5f5f5]",
                      )}
                    >
                      {fullCellRender?.(dayjs(date), info) ??
                        cellRender?.(dayjs(date), info) ??
                        origin}
                    </div>
                  );
                })}
                {eventSegments.map(({ event, startIndex, endIndex, lane }) => {
                  const span = endIndex - startIndex + 1;
                  return (
                    <button
                      key={`${String(event.key)}-${weekKey}`}
                      type="button"
                      data-calendar-event-key={String(event.key)}
                      className={twMerge(
                        "absolute z-[2] h-[18px] overflow-hidden rounded-full px-2 text-left text-xs leading-[18px] whitespace-nowrap text-white shadow-sm",
                        onEventClick ? "cursor-pointer hover:brightness-95" : "pointer-events-none",
                      )}
                      style={{
                        top: 32 + lane * 20,
                        left: `calc(${(startIndex * 100) / 7}% + 8px)`,
                        width: `calc(${(span * 100) / 7}% - 16px)`,
                        backgroundColor: event.color ?? "var(--color-primary)",
                      }}
                      onClick={onEventClick ? () => onEventClick(event) : undefined}
                    >
                      {event.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
