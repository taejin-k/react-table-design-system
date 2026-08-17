import { createPortal } from "react-dom";
import { useMemo, useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Tag } from "../Tag";
import { ErrorMessage } from "../ErrorMessage";
import { Icon } from "../Icon";
import { Label } from "../Label";
import { TimePanel } from "../TimePicker/TimePicker";
import { getPopupMotionStyle } from "../_internal/motion";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type {
  DatePickerMode,
  DatePickerProps,
  DatePickerValue,
  DateRangePickerProps,
} from "./DatePicker.types";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getWeek(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function formatDate(date: Date, picker: DatePickerMode, time?: string) {
  let value: string;
  if (picker === "year") value = String(date.getFullYear());
  else if (picker === "quarter")
    value = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
  else if (picker === "month") value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  else if (picker === "week") value = `${date.getFullYear()}-W${pad(getWeek(date))}`;
  else value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return time ? `${value} ${time}` : value;
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const datePart = value.split(" ")[0];
  const quarterMatch = /^(\d{4})-Q([1-4])$/.exec(datePart);
  if (quarterMatch) return new Date(Number(quarterMatch[1]), (Number(quarterMatch[2]) - 1) * 3, 1);
  const weekMatch = /^(\d{4})-W(\d{2})$/.exec(datePart);
  if (weekMatch) {
    const year = Number(weekMatch[1]);
    const week = Number(weekMatch[2]);
    const januaryFourth = new Date(year, 0, 4);
    const monday = new Date(januaryFourth);
    monday.setDate(januaryFourth.getDate() - ((januaryFourth.getDay() + 6) % 7) + (week - 1) * 7);
    return monday;
  }
  const [year, month = 1, day = 1] = datePart.split("-").map(Number);
  const result = new Date(year, month - 1, day);
  return Number.isNaN(result.getTime()) ? null : result;
}

function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function formatDisplayValue(value: string, format?: DatePickerProps["format"]) {
  if (typeof format === "function") return format(value);
  if (!format) return value;
  const date = parseDate(value);
  if (!date) return value;
  return format
    .replace("YYYY", String(date.getFullYear()))
    .replace("MM", pad(date.getMonth() + 1))
    .replace("DD", pad(date.getDate()))
    .replace("Q", String(Math.floor(date.getMonth() / 3) + 1))
    .replace("WW", pad(getWeek(date)));
}

function BaseDatePicker({
  value,
  defaultValue,
  defaultPickerValue,
  pickerValue,
  picker = "date",
  placeholder,
  format,
  size = "md",
  variant = "default",
  label,
  errorMessage,
  required = false,
  disabled = false,
  readOnly = false,
  width,
  allowClear = true,
  multiple = false,
  order = true,
  minDate,
  maxDate,
  showWeek = picker === "week",
  showNow = picker === "date",
  showTime = false,
  needConfirm = Boolean(showTime),
  open,
  defaultOpen = false,
  placement = "bottomLeft",
  disabledDate,
  cellRender,
  renderExtraFooter,
  presets,
  className,
  onChange,
  onCalendarChange,
  onClear,
  onOk,
  onPanelChange,
  onOpenChange,
}: DatePickerProps) {
  const initialValues = Array.isArray(defaultValue)
    ? defaultValue
    : defaultValue
      ? [defaultValue]
      : [];
  const [innerValues, setInnerValues] = useState<DatePickerValue[]>(initialValues);
  const selectedValues =
    value === undefined ? innerValues : Array.isArray(value) ? value : value ? [value] : [];
  const [pendingValues, setPendingValues] = useState(selectedValues);
  const [selectedTime, setSelectedTime] = useState(
    (typeof showTime === "object" ? showTime.defaultOpenValue : undefined) ?? "00:00:00",
  );
  const showTimeConfig = typeof showTime === "object" ? showTime : {};
  const showTimeSecond =
    showTimeConfig.showSecond ??
    (showTimeConfig.format !== "HH:mm" && showTimeConfig.format !== "hh:mm A");
  const selectedDate = parseDate(selectedValues[0]);
  const [innerPanelDate, setInnerPanelDate] = useState(
    () => parseDate(defaultPickerValue) ?? selectedDate ?? new Date(),
  );
  const panelDate = parseDate(pickerValue) ?? innerPanelDate;
  const floating = useFloatingLayer({
    placement,
    trigger: "click",
    disabled: disabled || readOnly,
    open,
    defaultOpen,
    onOpenChange: (nextOpen) => {
      if (nextOpen) {
        if (pickerValue === undefined)
          setInnerPanelDate(
            parseDate(defaultPickerValue) ?? parseDate(selectedValues[0]) ?? new Date(),
          );
        setPendingValues(selectedValues);
        const selectedTimeValue = selectedValues[0]?.split(" ")[1];
        if (showTime && selectedTimeValue) setSelectedTime(selectedTimeValue);
      }
      onOpenChange?.(nextOpen);
    },
  });

  const emitValues = (nextValues: string[], close = false) => {
    const sorted = order ? [...nextValues].sort() : nextValues;
    if (value === undefined) setInnerValues(sorted);
    const outputValue = multiple ? sorted : (sorted[0] ?? null);
    const outputString = multiple
      ? sorted.map((item) => formatDisplayValue(item, format))
      : typeof outputValue === "string"
        ? formatDisplayValue(outputValue, format)
        : "";
    onChange?.(outputValue, outputString);
    if (close) floating.changeOpen(false, "menu");
  };

  const selectDate = (date: Date) => {
    const rawValue = formatDate(date, picker, showTime ? selectedTime : undefined);
    const currentValues = needConfirm ? pendingValues : selectedValues;
    const nextValues = multiple
      ? currentValues.includes(rawValue)
        ? currentValues.filter((item) => item !== rawValue)
        : [...currentValues, rawValue]
      : [rawValue];
    onCalendarChange?.(multiple ? nextValues : nextValues[0]);
    if (needConfirm) {
      setPendingValues(nextValues);
      return;
    }
    emitValues(nextValues, !multiple);
  };

  const changePanelDate = (nextDate: Date) => {
    if (pickerValue === undefined) setInnerPanelDate(nextDate);
    onPanelChange?.(formatDate(nextDate, picker), picker);
  };

  const clear = () => {
    emitValues([]);
    setPendingValues([]);
    onClear?.();
  };

  const changeSelectedTime = (nextTime: string) => {
    setSelectedTime(nextTime);
    setPendingValues((current) => current.map((item) => `${item.split(" ")[0]} ${nextTime}`));
  };

  return (
    <div className={twMerge("flex w-full flex-col gap-1", className)} style={{ width }}>
      {label ? <Label label={label} required={required} size={size} /> : null}
      <span ref={floating.triggerRef} className="block w-full" {...floating.triggerProps}>
        <button
          type="button"
          disabled={disabled}
          aria-readonly={readOnly || undefined}
          className={pickerRootVariants({
            size,
            variant,
            error: Boolean(errorMessage),
            disabled,
            readOnly,
          })}
        >
          <span
            className={twMerge(
              "flex min-w-0 flex-1 flex-wrap gap-1",
              !selectedValues.length && "text-[#999]",
            )}
          >
            {selectedValues.length
              ? selectedValues.map((item) => (
                  <Tag
                    key={item}
                    color="grey"
                    variant="filled"
                    className={twMerge(
                      !multiple && "h-auto bg-transparent p-0 text-sm text-[#111]",
                    )}
                  >
                    {formatDisplayValue(item, format)}
                  </Tag>
                ))
              : (placeholder ?? pickerPlaceholder(picker))}
          </span>
          {allowClear && selectedValues.length && !disabled && !readOnly ? (
            <span
              className="cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                clear();
              }}
            >
              {typeof allowClear === "object" && allowClear.clearIcon ? (
                allowClear.clearIcon
              ) : (
                <Icon icon="close" color="#999" />
              )}
            </span>
          ) : (
            <Icon icon="calendar" color="#999" />
          )}
        </button>
      </span>
      <ErrorMessage errorMessage={errorMessage} />
      {floating.isRendered && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={floating.popupRef}
              data-datepicker-popup
              className={twMerge(
                "fixed rounded-lg bg-white p-3 font-pretendard text-sm text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.06),0_3px_6px_-4px_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.03)]",
                showTime ? "w-[468px]" : "w-[296px]",
                !floating.isMotionVisible && "pointer-events-none",
              )}
              style={{
                left: floating.position?.left ?? 0,
                top: floating.position?.top ?? 0,
                zIndex: 1050,
                visibility: floating.position ? "visible" : "hidden",
                ...getPopupMotionStyle(floating.position?.placement, floating.isMotionVisible),
              }}
              {...floating.popupProps}
            >
              {presets?.length ? (
                <div className="mb-2 flex flex-wrap gap-1 border-b border-[#f0f0f0] pb-2">
                  {presets.map((preset) => (
                    <Button
                      key={String(preset.label)}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const presetValue =
                          typeof preset.value === "function" ? preset.value() : preset.value;
                        const nextValues = multiple
                          ? [...selectedValues, presetValue]
                          : [presetValue];
                        emitValues(Array.from(new Set(nextValues)), !multiple);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              ) : null}
              <div className={twMerge(showTime && "flex divide-x divide-[#f0f0f0]")}>
                <div className={twMerge(showTime && "min-w-[272px] pr-3")}>
                  <PickerPanel
                    picker={picker}
                    panelDate={panelDate}
                    selectedValues={needConfirm ? pendingValues : selectedValues}
                    disabledDate={(date) => {
                      const min = parseDate(minDate);
                      const max = parseDate(maxDate);
                      return (
                        Boolean(min && date < min) ||
                        Boolean(max && date > max) ||
                        Boolean(disabledDate?.(date))
                      );
                    }}
                    showWeek={showWeek}
                    showNow={showNow}
                    cellRender={cellRender}
                    onPanelDateChange={changePanelDate}
                    onSelect={selectDate}
                  />
                </div>
                {showTime ? (
                  <div className="pl-3">
                    <div className="mb-1 text-xs font-medium text-[#777]">시간</div>
                    <TimePanel
                      value={selectedTime}
                      className="h-[250px] overflow-hidden"
                      use12Hours={showTimeConfig.use12Hours}
                      showSecond={showTimeSecond}
                      hourStep={showTimeConfig.hourStep}
                      minuteStep={showTimeConfig.minuteStep}
                      secondStep={showTimeConfig.secondStep}
                      disabledTime={showTimeConfig.disabledTime}
                      hideDisabledOptions={showTimeConfig.hideDisabledOptions}
                      changeOnScroll={showTimeConfig.changeOnScroll}
                      cellRender={showTimeConfig.cellRender}
                      onChange={(nextTime) =>
                        changeSelectedTime(
                          `${pad(nextTime.hour)}:${pad(nextTime.minute)}${
                            showTimeSecond ? `:${pad(nextTime.second)}` : ""
                          }`,
                        )
                      }
                    />
                  </div>
                ) : null}
              </div>
              {renderExtraFooter ? (
                <div className="mt-2 border-t border-[#f0f0f0] pt-2">
                  {renderExtraFooter(picker)}
                </div>
              ) : null}
              {needConfirm ? (
                <div className="mt-2 flex justify-end border-t border-[#f0f0f0] pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      emitValues(pendingValues, true);
                      onOk?.(multiple ? pendingValues : (pendingValues[0] ?? null));
                    }}
                  >
                    확인
                  </Button>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function PickerPanel({
  picker,
  panelDate,
  selectedValues,
  disabledDate,
  showWeek,
  showNow,
  cellRender,
  onPanelDateChange,
  onSelect,
}: {
  picker: DatePickerMode;
  panelDate: Date;
  selectedValues: string[];
  disabledDate: (date: Date) => boolean;
  showWeek: boolean;
  showNow: boolean;
  cellRender?: DatePickerProps["cellRender"];
  onPanelDateChange: (date: Date) => void;
  onSelect: (date: Date) => void;
}) {
  const changePanel = (amount: number) => {
    const next = new Date(panelDate);
    if (picker === "year") next.setFullYear(next.getFullYear() + amount * 12);
    else if (picker === "month" || picker === "quarter")
      next.setFullYear(next.getFullYear() + amount);
    else next.setMonth(next.getMonth() + amount);
    onPanelDateChange(next);
  };

  return (
    <>
      <div className="mb-2 flex h-8 items-center justify-between">
        <Icon icon="chevron-left" onClick={() => changePanel(-1)} />
        <strong>{panelTitle(panelDate, picker)}</strong>
        <Icon icon="chevron-right" onClick={() => changePanel(1)} />
      </div>
      {picker === "date" || picker === "week" ? (
        <DateGrid
          picker={picker}
          panelDate={panelDate}
          selectedValues={selectedValues}
          disabledDate={disabledDate}
          showWeek={showWeek}
          cellRender={cellRender}
          onSelect={onSelect}
        />
      ) : picker === "month" ? (
        <MonthGrid
          panelDate={panelDate}
          selectedValues={selectedValues}
          disabledDate={disabledDate}
          cellRender={cellRender}
          onSelect={onSelect}
        />
      ) : picker === "quarter" ? (
        <QuarterGrid
          panelDate={panelDate}
          selectedValues={selectedValues}
          disabledDate={disabledDate}
          cellRender={cellRender}
          onSelect={onSelect}
        />
      ) : (
        <YearGrid
          panelDate={panelDate}
          selectedValues={selectedValues}
          disabledDate={disabledDate}
          cellRender={cellRender}
          onSelect={onSelect}
        />
      )}
      {showNow ? (
        <div className="mt-2 border-t border-[#f0f0f0] pt-2 text-right">
          <Button size="sm" variant="ghost" onClick={() => onSelect(new Date())}>
            오늘
          </Button>
        </div>
      ) : null}
    </>
  );
}

function DateGrid({
  picker,
  panelDate,
  selectedValues,
  disabledDate,
  showWeek,
  cellRender,
  onSelect,
}: {
  picker: "date" | "week";
  panelDate: Date;
  selectedValues: string[];
  disabledDate: (date: Date) => boolean;
  showWeek: boolean;
  cellRender?: DatePickerProps["cellRender"];
  onSelect: (date: Date) => void;
}) {
  const days = useMemo(() => calendarDays(panelDate), [panelDate]);
  const columns = showWeek ? 8 : 7;
  return (
    <div
      className="grid text-center"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {showWeek ? <span className="py-1 text-xs text-[#999]">주</span> : null}
      {weekdays.map((weekday) => (
        <span key={weekday} className="py-1 text-xs text-[#999]">
          {weekday}
        </span>
      ))}
      {days.map((date, index) => {
        const dateValue = formatDate(date, picker);
        const muted = date.getMonth() !== panelDate.getMonth();
        const selected = selectedValues.some((item) => item.startsWith(dateValue));
        const dateDisabled = disabledDate(date);
        const originNode = <>{date.getDate()}</>;
        return (
          <div key={`${formatDate(date, "date")}-${picker}`} className="contents">
            {showWeek && index % 7 === 0 ? (
              <span className="flex items-center justify-center text-xs text-[#999]">
                {getWeek(date)}
              </span>
            ) : null}
            <button
              type="button"
              disabled={dateDisabled}
              className={twMerge(
                "mx-auto my-0.5 flex size-8 cursor-pointer items-center justify-center rounded hover:bg-[#e6f4ff]",
                muted && "text-[#bbb]",
                selected && "bg-[#0062df] text-white hover:bg-[#0062df]",
                dateDisabled && "cursor-not-allowed bg-[#fafafa] text-[#ccc] hover:bg-[#fafafa]",
              )}
              onClick={() => onSelect(date)}
            >
              {cellRender
                ? cellRender(date, { originNode, today: new Date(), type: picker })
                : originNode}
            </button>
          </div>
        );
      })}
    </div>
  );
}

interface PickerGridProps {
  panelDate: Date;
  selectedValues: string[];
  disabledDate: (date: Date) => boolean;
  cellRender?: DatePickerProps["cellRender"];
  onSelect: (date: Date) => void;
}

function MonthGrid({
  panelDate,
  selectedValues,
  disabledDate,
  cellRender,
  onSelect,
}: PickerGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 12 }, (_, month) => {
        const date = new Date(panelDate.getFullYear(), month, 1);
        const selected = selectedValues.includes(formatDate(date, "month"));
        const disabled = disabledDate(date);
        const originNode = <>{month + 1}월</>;
        return (
          <button
            key={month}
            type="button"
            disabled={disabled}
            className={twMerge(
              "h-10 cursor-pointer rounded hover:bg-[#e6f4ff]",
              selected && "bg-[#0062df] text-white hover:bg-[#0062df]",
              disabled && "cursor-not-allowed bg-[#fafafa] text-[#ccc] hover:bg-[#fafafa]",
            )}
            onClick={() => onSelect(date)}
          >
            {cellRender
              ? cellRender(date, { originNode, today: new Date(), type: "month" })
              : originNode}
          </button>
        );
      })}
    </div>
  );
}

function QuarterGrid({
  panelDate,
  selectedValues,
  disabledDate,
  cellRender,
  onSelect,
}: PickerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 4 }, (_, quarter) => {
        const date = new Date(panelDate.getFullYear(), quarter * 3, 1);
        const selected = selectedValues.includes(formatDate(date, "quarter"));
        const disabled = disabledDate(date);
        const originNode = <>Q{quarter + 1}</>;
        return (
          <button
            key={quarter}
            type="button"
            disabled={disabled}
            className={twMerge(
              "h-12 cursor-pointer rounded hover:bg-[#e6f4ff]",
              selected && "bg-[#0062df] text-white hover:bg-[#0062df]",
              disabled && "cursor-not-allowed bg-[#fafafa] text-[#ccc] hover:bg-[#fafafa]",
            )}
            onClick={() => onSelect(date)}
          >
            {cellRender
              ? cellRender(date, { originNode, today: new Date(), type: "quarter" })
              : originNode}
          </button>
        );
      })}
    </div>
  );
}

function YearGrid({
  panelDate,
  selectedValues,
  disabledDate,
  cellRender,
  onSelect,
}: PickerGridProps) {
  const startYear = Math.floor(panelDate.getFullYear() / 12) * 12;
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 12 }, (_, index) => {
        const year = startYear + index;
        const date = new Date(year, 0, 1);
        const selected = selectedValues.includes(String(year));
        const disabled = disabledDate(date);
        const originNode = <>{year}</>;
        return (
          <button
            key={year}
            type="button"
            disabled={disabled}
            className={twMerge(
              "h-10 cursor-pointer rounded hover:bg-[#e6f4ff]",
              selected && "bg-[#0062df] text-white hover:bg-[#0062df]",
              disabled && "cursor-not-allowed bg-[#fafafa] text-[#ccc] hover:bg-[#fafafa]",
            )}
            onClick={() => onSelect(date)}
          >
            {cellRender
              ? cellRender(date, { originNode, today: new Date(), type: "year" })
              : originNode}
          </button>
        );
      })}
    </div>
  );
}

function pickerPlaceholder(picker: DatePickerMode) {
  if (picker === "year") return "연도를 선택하세요";
  if (picker === "quarter") return "분기를 선택하세요";
  if (picker === "month") return "월을 선택하세요";
  if (picker === "week") return "주를 선택하세요";
  return "날짜를 선택하세요";
}

function panelTitle(date: Date, picker: DatePickerMode) {
  if (picker === "year") {
    const start = Math.floor(date.getFullYear() / 12) * 12;
    return `${start} - ${start + 11}`;
  }
  if (picker === "month" || picker === "quarter") return `${date.getFullYear()}년`;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function DateRangePicker({
  value,
  defaultValue = [null, null],
  placeholder = ["시작 날짜", "종료 날짜"],
  label,
  errorMessage,
  required = false,
  size = "md",
  presets,
  onChange,
  onCalendarChange,
  className,
  width,
  ...props
}: DateRangePickerProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const selectedValue = value ?? innerValue;
  const changeRange = (index: 0 | 1, nextValue: DatePickerValue | DatePickerValue[] | null) => {
    const normalized = Array.isArray(nextValue) ? (nextValue[0] ?? null) : nextValue;
    const nextRange: [DatePickerValue | null, DatePickerValue | null] = [...selectedValue];
    nextRange[index] = normalized;
    if (value === undefined) setInnerValue(nextRange);
    onChange?.(nextRange, [nextRange[0] ?? "", nextRange[1] ?? ""]);
    onCalendarChange?.(nextRange, { range: index === 0 ? "start" : "end" });
  };

  return (
    <div className={twMerge("flex w-full flex-col gap-1", className)} style={{ width }}>
      {label ? <Label label={label} required={required} size={size} /> : null}
      {presets?.length ? (
        <div className="mb-1 flex flex-wrap gap-1">
          {presets.map((preset) => (
            <Button
              key={String(preset.label)}
              size="sm"
              variant="secondary"
              onClick={() => {
                const nextRange =
                  typeof preset.value === "function" ? preset.value() : preset.value;
                if (value === undefined) setInnerValue(nextRange);
                onChange?.(nextRange, [nextRange[0] ?? "", nextRange[1] ?? ""]);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <BaseDatePicker
          {...props}
          size={size}
          value={selectedValue[0]}
          placeholder={placeholder[0]}
          onChange={(nextValue) => changeRange(0, nextValue)}
        />
        <span className="pt-1.5 text-[#999]">-</span>
        <BaseDatePicker
          {...props}
          size={size}
          value={selectedValue[1]}
          placeholder={placeholder[1]}
          disabledDate={(date) => {
            const start = parseDate(selectedValue[0]);
            return Boolean(start && date < start) || Boolean(props.disabledDate?.(date));
          }}
          onChange={(nextValue) => changeRange(1, nextValue)}
        />
      </div>
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
}

type DatePickerComponent = typeof BaseDatePicker & { RangePicker: typeof DateRangePicker };

export const DatePicker = Object.assign(BaseDatePicker, {
  RangePicker: DateRangePicker,
}) as DatePickerComponent;

const pickerRootVariants = cva(
  "flex w-full cursor-pointer items-center gap-2 rounded border border-solid bg-white px-2.5 text-left font-pretendard font-medium text-[#111] transition-colors hover:border-[#0062df] focus-visible:border-[#0062df] focus-visible:outline-none",
  {
    variants: {
      size: { lg: "min-h-10 text-base", md: "min-h-[30px] text-sm", sm: "min-h-5 text-xs" },
      variant: {
        default: "border-[#ddd]",
        outlined: "border-[#ddd]",
        filled: "border-[#f5f5f5] bg-[#f5f5f5]",
        borderless: "border-transparent",
        underlined: "rounded-none border-x-0 border-t-0 border-b-[#ddd] px-0",
      },
      error: { true: "border-[#fe5150]", false: "" },
      readOnly: {
        true: "cursor-default bg-white hover:border-[#ddd]",
        false: "",
      },
      disabled: {
        true: "cursor-not-allowed border-[#ddd] bg-[#f8f8f8] text-[#999] hover:border-[#ddd]",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      error: false,
      disabled: false,
      readOnly: false,
    },
  },
);
