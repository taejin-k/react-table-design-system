import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { resolveColorToken } from "../../color-tokens";
import { ScrollArea } from "../_internal/ScrollArea";
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
  continuesBefore: boolean;
  continuesAfter: boolean;
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
        continuesBefore: start < weekStart,
        continuesAfter: end > weekEnd,
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
  const cellPointerRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
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
  const handleCellPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    cellPointerRef.current = { x: event.clientX, y: event.clientY, moved: false };
  };
  const handleCellPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = cellPointerRef.current;
    if (!start || start.moved) return;
    start.moved = Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4;
  };
  const handleCellContentClick = (event: MouseEvent<HTMLDivElement>, date: Date) => {
    const moved = cellPointerRef.current?.moved ?? false;
    cellPointerRef.current = null;
    if (moved || event.defaultPrevented) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest(
        "button, a, input, select, textarea, [contenteditable='true'], [data-scroll-track], [data-scroll-thumb]",
      )
    )
      return;
    choose(date);
  };
  const defaultHeader = (
    <div className="flex flex-wrap items-center justify-end px-2 py-2 max-[480px]:grid max-[480px]:grid-cols-2 max-[480px]:gap-2">
      <Select
        value={panel.getFullYear()}
        allowClear={false}
        size="md"
        width={108}
        className="w-auto"
        options={Array.from({ length: 20 }, (_, index) => panel.getFullYear() - 10 + index).map(
          (year) => ({ label: String(year), value: year }),
        )}
        onChange={(nextYear) => changePanel(new Date(Number(nextYear), panel.getMonth(), 1))}
      />
      <Select
        value={panel.getMonth()}
        allowClear={false}
        size="md"
        width={88}
        className="ml-2 w-auto max-[480px]:ml-0"
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
        "bg-white font-pretendard text-sm text-dark",
        fullscreen ? "w-full" : "w-[300px] rounded-lg",
        className,
      )}
    >
      {header}
      <div className={fullscreen ? "py-2" : "p-2"}>
        <div
          className={twMerge(
            "grid grid-cols-7",
            fullscreen ? "text-right text-dark-gray" : "text-center",
          )}
        >
          {weekdays.map((day) => (
            <span key={day} className={fullscreen ? "h-6 pr-3" : "py-1 text-xs text-gray"}>
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
                        "relative flex w-full cursor-pointer transition-colors duration-200 ease-out outline-none disabled:cursor-not-allowed disabled:text-border motion-reduce:transition-none",
                        fullscreen
                          ? "mx-1 h-[90px] w-[calc(100%-8px)] items-start justify-end border-t-2 border-hover px-2 pt-1 group-hover/calendar-cell:bg-hover hover:bg-hover"
                          : "size-8 items-center justify-center rounded p-0 group-hover/calendar-cell:bg-hover hover:bg-hover",
                        outside && "text-disabled",
                        fullscreen && sameDate(date, today) && "border-t-primary",
                        sameDate(date, selected) &&
                          (fullscreen
                            ? "bg-selected group-hover/calendar-cell:bg-selected hover:bg-selected"
                            : "bg-selected text-primary group-hover/calendar-cell:bg-selected hover:bg-selected"),
                        fullscreen &&
                          disabled &&
                          (sameDate(date, selected) ? "hover:bg-selected" : "hover:bg-transparent"),
                        !fullscreen &&
                          disabled &&
                          "bg-transparent text-border hover:bg-transparent [&_*]:text-border!",
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
                  const fullCell = fullCellRender?.(dayjs(date), info);
                  const cellContent = cellRender?.(dayjs(date), info);
                  const hasCellContent = cellContent !== null && cellContent !== undefined;
                  const handlesCellContentClick = fullCell == null && hasCellContent;
                  return (
                    <div
                      key={date.toISOString()}
                      data-calendar-cell
                      className={twMerge(
                        "relative",
                        !disabled && "group/calendar-cell cursor-pointer",
                        !fullscreen && "my-0.5 flex h-8 items-center justify-center",
                        !fullscreen && disabled && "bg-hover",
                      )}
                      onPointerDownCapture={
                        handlesCellContentClick ? handleCellPointerDown : undefined
                      }
                      onPointerMoveCapture={
                        handlesCellContentClick ? handleCellPointerMove : undefined
                      }
                      onClick={
                        handlesCellContentClick
                          ? (event) => handleCellContentClick(event, date)
                          : undefined
                      }
                    >
                      {fullCell ?? origin}
                      {fullCell == null && hasCellContent && fullscreen && (
                        <ScrollArea
                          verticalOnly
                          viewportMarker="data-calendar-schedule-scroll-container"
                          className="absolute inset-x-3 top-7 bottom-1"
                          viewportClassName="overscroll-contain pr-2"
                          contentClassName="grid auto-rows-min content-start gap-0.5"
                        >
                          {cellContent}
                        </ScrollArea>
                      )}
                      {fullCell == null && hasCellContent && !fullscreen ? cellContent : null}
                    </div>
                  );
                })}
                {eventSegments.map(
                  ({ event, startIndex, endIndex, lane, continuesBefore, continuesAfter }) => {
                    const span = endIndex - startIndex + 1;
                    const startInset = continuesBefore ? 0 : 8;
                    const endInset = continuesAfter ? 0 : 8;
                    return (
                      <button
                        key={`${String(event.key)}-${weekKey}`}
                        type="button"
                        data-calendar-event-key={String(event.key)}
                        className={twMerge(
                          "absolute z-[2] h-[18px] overflow-hidden px-2 text-left text-xs leading-[18px] text-ellipsis whitespace-nowrap text-white shadow-xs transition-[filter,opacity] duration-200 ease-out outline-none motion-reduce:transition-none",
                          !continuesBefore && "rounded-l-full",
                          !continuesAfter && "rounded-r-full",
                          onEventClick
                            ? "cursor-pointer hover:brightness-95"
                            : "pointer-events-none",
                        )}
                        style={{
                          top: 32 + lane * 20,
                          left: `calc(${(startIndex * 100) / 7}% + ${startInset}px)`,
                          width: `calc(${(span * 100) / 7}% - ${startInset + endInset}px)`,
                          backgroundColor:
                            event.color === undefined
                              ? "var(--color-primary)"
                              : resolveColorToken(event.color),
                        }}
                        onClick={onEventClick ? () => onEventClick(event) : undefined}
                      >
                        {event.title}
                      </button>
                    );
                  },
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
