import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Tag } from "../Tag";
import { ErrorMessage } from "../ErrorMessage";
import { Dropdown } from "../Dropdown";
import { Icon } from "../Icon";
import { Label } from "../Label";
import { TimePanel } from "../TimePicker/TimePicker";
import { getPopupMotionStyle } from "../_internal/motion";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type {
  DatePickerModeType,
  DatePickerProps,
  DatePickerShowTime,
  DateRangePickerProps,
  DateRangeValueType,
} from "./DatePicker.types";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const multipleTagSizeClasses = {
  lg: "h-8 text-xs",
  md: "h-[22px]",
} as const;
type DatePickerLayoutPosition = { left: number; top: number };
type InternalDateRangeValue = [string | null, string | null];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function resolveAvailableTime(value: string, config: DatePickerShowTime, showSecond: boolean) {
  const [preferredHour = 0, preferredMinute = 0, preferredSecond = 0] = value
    .split(":")
    .map(Number);
  const disabled = config.disabledTime?.() ?? {};
  const availableValue = (
    length: number,
    step: number | undefined,
    preferred: number,
    disabledValues: number[],
  ) => {
    const values = Array.from(
      { length: Math.ceil(length / Math.max(step ?? 1, 1)) },
      (_, index) => index * Math.max(step ?? 1, 1),
    );
    if (values.includes(preferred) && !disabledValues.includes(preferred)) return preferred;
    return values.find((item) => !disabledValues.includes(item)) ?? preferred;
  };
  const hour = availableValue(24, config.hourStep, preferredHour, disabled.disabledHours?.() ?? []);
  const minute = availableValue(
    60,
    config.minuteStep,
    preferredMinute,
    disabled.disabledMinutes?.(hour) ?? [],
  );
  const second = showSecond
    ? availableValue(
        60,
        config.secondStep,
        preferredSecond,
        disabled.disabledSeconds?.(hour, minute) ?? [],
      )
    : 0;
  return `${pad(hour)}:${pad(minute)}${showSecond ? `:${pad(second)}` : ""}`;
}

function formatDate(date: Date, picker: DatePickerModeType, time?: string) {
  let value: string;
  if (picker === "year") value = String(date.getFullYear());
  else if (picker === "month") value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  else value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return time ? `${value} ${time}` : value;
}

function toInternalValue(
  value: unknown,
  picker: DatePickerModeType,
  showTime: boolean,
  showSecond: boolean,
) {
  const normalizedValue = normalizeDayjs(value);
  if (!normalizedValue) return null;
  return formatDate(
    normalizedValue.toDate(),
    picker,
    showTime ? normalizedValue.format(showSecond ? "HH:mm:ss" : "HH:mm") : undefined,
  );
}

function toDayjsValues(values: string[]) {
  return values.map((value) => dayjs(value));
}

function normalizeDayjs(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const normalizedValue = dayjs.isDayjs(value) ? value : dayjs(value as string | Date);
  return normalizedValue.isValid() ? normalizedValue : null;
}

function parseDate(value?: unknown) {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value.isValid() ? value.startOf("day").toDate() : null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : new Date(value);
  if (typeof value !== "string") return null;
  const datePart = value.split(" ")[0];
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
  if (typeof format === "function") return format(dayjs(value));
  if (!format) return value;
  const normalizedValue = dayjs(value);
  return normalizedValue.isValid() ? normalizedValue.format(format) : value;
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
  showNow = picker === "date",
  showTime = false,
  needConfirm = Boolean(showTime),
  open,
  defaultOpen = false,
  placement = "bottomLeft",
  disabledDate,
  cellRender,
  presets,
  className,
  onChange,
  onCalendarChange,
  onClear,
  onConfirm,
  onPanelChange,
  onOpenChange,
}: DatePickerProps) {
  const showTimeConfig = typeof showTime === "object" ? showTime : {};
  const showTimeSecond =
    showTimeConfig.showSecond ??
    (showTimeConfig.format !== "HH:mm" && showTimeConfig.format !== "hh:mm A");
  const serializeValue = (date: unknown) =>
    toInternalValue(date, picker, Boolean(showTime), showTimeSecond);
  const initialValues = Array.isArray(defaultValue)
    ? defaultValue.map(serializeValue).filter((item): item is string => item !== null)
    : defaultValue
      ? [serializeValue(defaultValue)].filter((item): item is string => item !== null)
      : [];
  const [innerValues, setInnerValues] = useState<string[]>(initialValues);
  const sourceValues =
    value === undefined
      ? innerValues
      : Array.isArray(value)
        ? value.map(serializeValue).filter((item): item is string => item !== null)
        : value
          ? [serializeValue(value)].filter((item): item is string => item !== null)
          : [];
  const selectedValues = order ? [...sourceValues].sort() : sourceValues;
  const selectedValuesKey = selectedValues.join("\u0000");
  const isDateDisabled = (date: Date) => {
    const min = parseDate(minDate);
    const max = parseDate(maxDate);
    return (
      Boolean(min && date < min) ||
      Boolean(max && date > max) ||
      Boolean(disabledDate?.(dayjs(date)))
    );
  };
  const multipleTriggerRef = useRef<HTMLButtonElement>(null);
  const multipleTagContainerRef = useRef<HTMLSpanElement>(null);
  const previousMultipleHeightRef = useRef<number | null>(null);
  const multipleHeightAnimationRef = useRef<Animation | null>(null);
  const previousMultipleLayoutRectsRef = useRef(new Map<string, DatePickerLayoutPosition>());
  const multipleLayoutAnimationsRef = useRef(
    new Map<string, { element: HTMLElement; animation: Animation }>(),
  );
  const defaultSelectedTime = resolveAvailableTime(
    normalizeDayjs(showTimeConfig.defaultOpenValue)?.format("HH:mm:ss") ??
      (showTimeConfig.use12Hours ? "01:00:00" : "00:00:00"),
    showTimeConfig,
    showTimeSecond,
  );
  const createDefaultPendingValues = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isDateDisabled(today)
      ? []
      : [formatDate(today, picker, showTime ? defaultSelectedTime : undefined)];
  };
  const createPendingValues = () =>
    selectedValues.length ? selectedValues : createDefaultPendingValues();
  const [pendingValues, setPendingValues] = useState<string[]>(createPendingValues);
  const [selectedTime, setSelectedTime] = useState(defaultSelectedTime);
  const [timePanelResetKey, setTimePanelResetKey] = useState(0);
  const showTimePopupWidth = showTime
    ? 292 + 56 * (2 + (showTimeSecond ? 1 : 0)) + (showTimeConfig.use12Hours ? 64 : 0)
    : undefined;
  const selectedDate = parseDate(selectedValues[0]);
  const [innerPanelDate, setInnerPanelDate] = useState(
    () => parseDate(defaultPickerValue) ?? selectedDate ?? new Date(),
  );
  const panelDate = parseDate(pickerValue) ?? innerPanelDate;
  const floating = useFloatingLayer({
    placement,
    trigger: "click",
    targetGap: 2,
    disabled: disabled || readOnly,
    open,
    defaultOpen,
    onOpenChange: (nextOpen) => {
      if (nextOpen) {
        if (pickerValue === undefined)
          setInnerPanelDate(
            parseDate(defaultPickerValue) ?? parseDate(selectedValues[0]) ?? new Date(),
          );
        setPendingValues(createPendingValues());
        const selectedTimeValue = selectedValues[0]?.split(" ")[1];
        if (showTime && selectedTimeValue)
          setSelectedTime(resolveAvailableTime(selectedTimeValue, showTimeConfig, showTimeSecond));
        else if (showTime) setSelectedTime(defaultSelectedTime);
      }
      onOpenChange?.(nextOpen);
    },
  });

  const emitValues = (nextValues: string[], close = false) => {
    const sorted = order ? [...nextValues].sort() : nextValues;
    if (value === undefined) setInnerValues(sorted);
    const outputValue = multiple ? toDayjsValues(sorted) : sorted[0] ? dayjs(sorted[0]) : null;
    onChange?.(outputValue);
    if (close) floating.changeOpen(false, "menu");
  };

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    const rawValue = formatDate(date, picker, showTime ? selectedTime : undefined);
    const currentValues = needConfirm ? pendingValues : selectedValues;
    const nextValues = multiple
      ? currentValues.includes(rawValue)
        ? currentValues.filter((item) => item !== rawValue)
        : [...currentValues, rawValue]
      : [rawValue];
    onCalendarChange?.(
      multiple ? toDayjsValues(nextValues) : nextValues[0] ? dayjs(nextValues[0]) : null,
    );
    if (needConfirm) {
      setPendingValues(nextValues);
      return;
    }
    emitValues(nextValues, !multiple);
  };

  const changePanelDate = (nextDate: Date) => {
    if (pickerValue === undefined) setInnerPanelDate(nextDate);
    onPanelChange?.(dayjs(nextDate), picker);
  };

  const clear = () => {
    emitValues([]);
    setPendingValues(createDefaultPendingValues());
    setSelectedTime(defaultSelectedTime);
    setTimePanelResetKey((current) => current + 1);
    if (pickerValue === undefined) setInnerPanelDate(parseDate(defaultPickerValue) ?? new Date());
    onClear?.();
  };

  const changeSelectedTime = (nextTime: string) => {
    const availableTime = resolveAvailableTime(nextTime, showTimeConfig, showTimeSecond);
    setSelectedTime(availableTime);
    setPendingValues((current) => current.map((item) => `${item.split(" ")[0]} ${availableTime}`));
  };

  useLayoutEffect(() => {
    if (!multiple) {
      previousMultipleHeightRef.current = null;
      multipleHeightAnimationRef.current?.cancel();
      multipleHeightAnimationRef.current = null;
      return;
    }

    const trigger = multipleTriggerRef.current;
    if (!trigger) return;

    const runningAnimation = multipleHeightAnimationRef.current;
    const renderedHeight = runningAnimation ? trigger.getBoundingClientRect().height : null;
    runningAnimation?.cancel();
    multipleHeightAnimationRef.current = null;

    const nextHeight = trigger.getBoundingClientRect().height;
    const previousHeight = previousMultipleHeightRef.current;
    previousMultipleHeightRef.current = nextHeight;

    if (
      previousHeight === null ||
      Math.abs(previousHeight - nextHeight) < 0.5 ||
      typeof trigger.animate !== "function" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const animation = trigger.animate(
      [
        { height: `${renderedHeight ?? previousHeight}px`, overflow: "hidden" },
        { height: `${nextHeight}px`, overflow: "hidden" },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.645, 0.045, 0.355, 1)",
      },
    );
    multipleHeightAnimationRef.current = animation;
    animation.addEventListener("finish", () => {
      if (multipleHeightAnimationRef.current === animation) {
        multipleHeightAnimationRef.current = null;
      }
    });
  }, [multiple, selectedValuesKey, size]);

  useLayoutEffect(() => {
    if (!multiple) {
      previousMultipleLayoutRectsRef.current.clear();
      multipleLayoutAnimationsRef.current.forEach(({ animation }) => animation.cancel());
      multipleLayoutAnimationsRef.current.clear();
      return;
    }

    const container = multipleTagContainerRef.current;
    if (!container) return;

    const elements = Array.from(
      container.querySelectorAll<HTMLElement>("[data-datepicker-layout-key]"),
    );
    const renderedRects = new Map<string, DatePickerLayoutPosition>();
    const renderedContainerRect = container.getBoundingClientRect();

    multipleLayoutAnimationsRef.current.forEach(({ element, animation }, key) => {
      if (element.isConnected) {
        const rect = element.getBoundingClientRect();
        renderedRects.set(key, {
          left: rect.left - renderedContainerRect.left,
          top: rect.top - renderedContainerRect.top,
        });
      }
      animation.cancel();
    });
    multipleLayoutAnimationsRef.current.clear();

    const nextRects = new Map<string, DatePickerLayoutPosition>();
    const nextContainerRect = container.getBoundingClientRect();
    elements.forEach((element) => {
      const key = element.dataset.datepickerLayoutKey;
      if (!key) return;
      const rect = element.getBoundingClientRect();
      nextRects.set(key, {
        left: rect.left - nextContainerRect.left,
        top: rect.top - nextContainerRect.top,
      });
    });

    const previousRects = previousMultipleLayoutRectsRef.current;
    previousMultipleLayoutRectsRef.current = nextRects;
    if (
      previousRects.size === 0 ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    elements.forEach((element) => {
      const key = element.dataset.datepickerLayoutKey;
      const nextRect = key ? nextRects.get(key) : undefined;
      const previousRect = key ? (renderedRects.get(key) ?? previousRects.get(key)) : undefined;
      if (!key || !nextRect || !previousRect || typeof element.animate !== "function") return;

      const translateX = previousRect.left - nextRect.left;
      const translateY = previousRect.top - nextRect.top;
      if (Math.abs(translateX) < 0.5 && Math.abs(translateY) < 0.5) return;

      const animation = element.animate(
        [
          { transform: `translate(${translateX}px, ${translateY}px)` },
          { transform: "translate(0, 0)" },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.645, 0.045, 0.355, 1)",
        },
      );
      multipleLayoutAnimationsRef.current.set(key, { element, animation });
      animation.addEventListener("finish", () => {
        if (multipleLayoutAnimationsRef.current.get(key)?.animation === animation) {
          multipleLayoutAnimationsRef.current.delete(key);
        }
      });
    });
  }, [multiple, selectedValuesKey]);

  useLayoutEffect(() => {
    if (!multiple) return;

    const container = multipleTagContainerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    let previousWidth = container.getBoundingClientRect().width;

    const syncLayoutAfterWidthChange = () => {
      const containerRect = container.getBoundingClientRect();
      if (Math.abs(previousWidth - containerRect.width) < 0.5) return;
      previousWidth = containerRect.width;

      multipleLayoutAnimationsRef.current.forEach(({ animation }) => animation.cancel());
      multipleLayoutAnimationsRef.current.clear();

      const nextRects = new Map<string, DatePickerLayoutPosition>();
      container.querySelectorAll<HTMLElement>("[data-datepicker-layout-key]").forEach((element) => {
        const key = element.dataset.datepickerLayoutKey;
        if (!key) return;
        const rect = element.getBoundingClientRect();
        nextRects.set(key, {
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
        });
      });
      previousMultipleLayoutRectsRef.current = nextRects;
    };

    const observer = new ResizeObserver(syncLayoutAfterWidthChange);
    observer.observe(container);
    return () => observer.disconnect();
  }, [multiple]);

  useEffect(
    () => () => {
      multipleHeightAnimationRef.current?.cancel();
      multipleLayoutAnimationsRef.current.forEach(({ animation }) => animation.cancel());
    },
    [],
  );

  return (
    <div className={twMerge("flex w-full flex-col gap-1", className)} style={{ width }}>
      {label ? <Label label={label} required={required} size={size} /> : null}
      <span ref={floating.triggerRef} className="block w-full" {...floating.triggerProps}>
        <button
          ref={multipleTriggerRef}
          type="button"
          disabled={disabled}
          className={twMerge(
            pickerRootVariants({
              size,
              variant,
              error: Boolean(errorMessage),
              disabled,
              readOnly,
              interactive: !disabled && !readOnly,
            }),
            multiple && selectedValues.length > 0 && ["items-start", "py-[3px] pl-[3px]"],
          )}
        >
          {multiple && selectedValues.length ? (
            <span
              ref={multipleTagContainerRef}
              className="flex min-w-0 flex-1 flex-wrap items-center gap-[5px]"
            >
              {selectedValues.map((item) => (
                <Tag
                  key={item}
                  data-datepicker-tag
                  data-datepicker-layout-key={`tag:${item}`}
                  color="grey"
                  variant="filled"
                  className={twMerge(
                    multipleTagSizeClasses[size],
                    "tabular-nums",
                    variant === "filled" && "bg-white",
                  )}
                  suffixIcon={
                    disabled || readOnly ? undefined : (
                      <Icon
                        icon="close"
                        size={12}
                        className="cursor-pointer"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                          event.stopPropagation();
                          emitValues(selectedValues.filter((value) => value !== item));
                        }}
                      />
                    )
                  }
                >
                  {formatDisplayValue(item, format)}
                </Tag>
              ))}
            </span>
          ) : (
            <span
              className={twMerge(
                "flex min-w-0 flex-1 flex-wrap gap-1",
                !selectedValues.length && "text-[#999]",
              )}
            >
              {selectedValues.length ? (
                <Tag
                  className={twMerge(
                    "h-auto bg-transparent p-0 text-sm",
                    disabled ? "text-[#999]" : "text-[#111]",
                  )}
                >
                  {formatDisplayValue(selectedValues[0], format)}
                </Tag>
              ) : (
                (placeholder ?? pickerPlaceholder(picker))
              )}
            </span>
          )}
          {allowClear && selectedValues.length && !disabled && !readOnly ? (
            <span
              className="cursor-pointer self-center"
              onClick={(event) => {
                event.stopPropagation();
                clear();
              }}
            >
              <Icon icon="close" color="#999" />
            </span>
          ) : (
            <Icon icon="calendar" color="#999" className="self-center" />
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
                !showTime && "w-[296px]",
                showTime && "pr-2",
                !floating.isMotionVisible && "pointer-events-none",
              )}
              style={{
                left: floating.position?.left ?? 0,
                top: floating.position?.top ?? 0,
                width: showTimePopupWidth,
                zIndex: 1050,
                visibility: floating.position ? "visible" : "hidden",
                ...getPopupMotionStyle(floating.position?.placement, floating.isMotionVisible),
              }}
              {...floating.popupProps}
            >
              <div className={twMerge(showTime && "flex divide-x divide-[#f0f0f0]")}>
                <div className={twMerge(showTime && "min-w-[272px] pr-3")}>
                  <PickerPanel
                    picker={picker}
                    panelDate={panelDate}
                    selectedValues={
                      needConfirm || selectedValues.length === 0 ? pendingValues : selectedValues
                    }
                    disabledDate={isDateDisabled}
                    cellRender={cellRender}
                    onPanelDateChange={changePanelDate}
                    onSelect={selectDate}
                  />
                </div>
                {showTime ? (
                  <div>
                    <div className="mb-1 pl-3 text-xs font-medium text-[#777]">시간</div>
                    <TimePanel
                      key={timePanelResetKey}
                      value={selectedTime}
                      className="h-[250px] overflow-hidden"
                      use12Hours={showTimeConfig.use12Hours}
                      showSecond={showTimeSecond}
                      hourStep={showTimeConfig.hourStep}
                      minuteStep={showTimeConfig.minuteStep}
                      secondStep={showTimeConfig.secondStep}
                      disabledTime={showTimeConfig.disabledTime}
                      hideDisabled={showTimeConfig.hideDisabled}
                      changeOnScroll={showTimeConfig.changeOnScroll}
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
              {presets?.length || showNow || needConfirm ? (
                <PickerFooter
                  presets={presets}
                  showNow={showNow}
                  showConfirm={needConfirm}
                  onPresetSelect={(index) => {
                    const preset = presets?.[index];
                    if (!preset) return;
                    const presetValue =
                      typeof preset.value === "function" ? preset.value() : preset.value;
                    const serializedPresetValue = serializeValue(presetValue);
                    if (!serializedPresetValue) return;
                    const nextValues = multiple
                      ? [...selectedValues, serializedPresetValue]
                      : [serializedPresetValue];
                    const uniqueValues = Array.from(new Set(nextValues));
                    if (needConfirm) {
                      setPendingValues(uniqueValues);
                      return;
                    }
                    emitValues(uniqueValues, !multiple);
                  }}
                  onNow={() => selectDate(new Date())}
                  onConfirm={() => {
                    emitValues(pendingValues, true);
                    onConfirm?.(
                      multiple
                        ? toDayjsValues(pendingValues)
                        : pendingValues[0]
                          ? dayjs(pendingValues[0])
                          : null,
                    );
                  }}
                />
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
  rangeValues,
  previousButton = true,
  nextButton = true,
  disabledDate,
  cellRender,
  onPanelDateChange,
  onSelect,
}: {
  picker: DatePickerModeType;
  panelDate: Date;
  selectedValues: string[];
  rangeValues?: InternalDateRangeValue;
  previousButton?: boolean;
  nextButton?: boolean;
  disabledDate: (date: Date) => boolean;
  cellRender?: DatePickerProps["cellRender"];
  onPanelDateChange: (date: Date) => void;
  onSelect: (date: Date) => void;
}) {
  const changePanel = (amount: number) => {
    const next = new Date(panelDate);
    if (picker === "year") next.setFullYear(next.getFullYear() + amount * 12);
    else if (picker === "month") next.setFullYear(next.getFullYear() + amount);
    else next.setMonth(next.getMonth() + amount);
    onPanelDateChange(next);
  };

  const changeYear = (amount: number) => {
    const next = new Date(panelDate);
    next.setFullYear(next.getFullYear() + amount);
    onPanelDateChange(next);
  };

  const showYearNavigation = picker === "date";

  return (
    <>
      <div
        className={twMerge(
          "mb-2 grid h-8 items-center",
          showYearNavigation ? "grid-cols-[64px_1fr_64px]" : "grid-cols-[32px_1fr_32px]",
        )}
      >
        <div className="flex">
          {previousButton && showYearNavigation ? (
            <button
              type="button"
              data-datepicker-previous-year
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded hover:bg-[#f5f5f5]"
              onClick={() => changeYear(-1)}
            >
              <Icon icon="double-left" color="#999" />
            </button>
          ) : null}
          {previousButton ? (
            <button
              type="button"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded hover:bg-[#f5f5f5]"
              onClick={() => changePanel(-1)}
            >
              <Icon icon="chevron-left" color="#999" />
            </button>
          ) : null}
        </div>
        <strong className="text-center">{panelTitle(panelDate, picker)}</strong>
        <div className="flex justify-end">
          {nextButton ? (
            <button
              type="button"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded hover:bg-[#f5f5f5]"
              onClick={() => changePanel(1)}
            >
              <Icon icon="chevron-right" color="#999" />
            </button>
          ) : null}
          {nextButton && showYearNavigation ? (
            <button
              type="button"
              data-datepicker-next-year
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded hover:bg-[#f5f5f5]"
              onClick={() => changeYear(1)}
            >
              <Icon icon="double-right" color="#999" />
            </button>
          ) : null}
        </div>
      </div>
      {picker === "date" ? (
        <DateGrid
          picker={picker}
          panelDate={panelDate}
          selectedValues={selectedValues}
          rangeValues={rangeValues}
          disabledDate={disabledDate}
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
      ) : (
        <YearGrid
          panelDate={panelDate}
          selectedValues={selectedValues}
          disabledDate={disabledDate}
          cellRender={cellRender}
          onSelect={onSelect}
        />
      )}
    </>
  );
}

function PickerFooter({
  presets,
  showNow,
  showConfirm = false,
  onPresetSelect,
  onNow,
  onConfirm,
}: {
  presets?: Array<{ label: ReactNode }>;
  showNow: boolean;
  showConfirm?: boolean;
  onPresetSelect: (index: number) => void;
  onNow: () => void;
  onConfirm?: () => void;
}) {
  const hasPresets = Boolean(presets?.length);

  return (
    <div className="mt-2 flex items-center justify-between border-t border-[#f0f0f0] pt-2">
      {hasPresets ? (
        <Dropdown
          menu={{
            items: (presets ?? []).map((preset, index) => ({
              label: preset.label,
              value: String(index),
            })),
            onClick: ({ value }) => onPresetSelect(Number(value)),
          }}
          placement="topLeft"
          trigger="click"
        >
          <Button variant="ghost">빠른 선택</Button>
        </Dropdown>
      ) : showNow ? (
        <Button variant="ghost" onClick={onNow}>
          오늘
        </Button>
      ) : (
        <span />
      )}
      {showConfirm ? <Button onClick={onConfirm}>확인</Button> : null}
    </div>
  );
}

function DateGrid({
  picker,
  panelDate,
  selectedValues,
  rangeValues,
  disabledDate,
  cellRender,
  onSelect,
}: {
  picker: "date";
  panelDate: Date;
  selectedValues: string[];
  rangeValues?: InternalDateRangeValue;
  disabledDate: (date: Date) => boolean;
  cellRender?: DatePickerProps["cellRender"];
  onSelect: (date: Date) => void;
}) {
  const days = useMemo(() => calendarDays(panelDate), [panelDate]);
  return (
    <div className="grid grid-cols-7 text-center">
      {weekdays.map((weekday) => (
        <span key={weekday} className="py-1 text-xs text-[#999]">
          {weekday}
        </span>
      ))}
      {days.map((date) => {
        const dateValue = formatDate(date, picker);
        const muted = date.getMonth() !== panelDate.getMonth();
        const visibleRangeDate = !rangeValues || !muted;
        const selected =
          visibleRangeDate && selectedValues.some((item) => item.startsWith(dateValue));
        const rangeStart = parseDate(rangeValues?.[0]);
        const rangeEnd = parseDate(rangeValues?.[1]);
        const inRange = Boolean(
          visibleRangeDate && rangeStart && rangeEnd && date >= rangeStart && date <= rangeEnd,
        );
        const isRangeStart = Boolean(visibleRangeDate && rangeStart && sameDay(date, rangeStart));
        const isRangeEnd = Boolean(visibleRangeDate && rangeEnd && sameDay(date, rangeEnd));
        const dateDisabled = disabledDate(date);
        const origin = <>{date.getDate()}</>;
        return (
          <div key={`${formatDate(date, "date")}-${picker}`} className="contents">
            <div
              className={twMerge(
                "relative my-0.5 flex h-8 items-center justify-center",
                inRange && !isRangeStart && !isRangeEnd && "bg-selected",
                inRange &&
                  isRangeStart &&
                  !isRangeEnd &&
                  "after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:left-1/2 after:bg-selected",
                inRange &&
                  isRangeEnd &&
                  !isRangeStart &&
                  "before:pointer-events-none before:absolute before:inset-y-0 before:right-1/2 before:left-0 before:bg-selected",
                dateDisabled && "bg-[#f5f5f5]",
              )}
            >
              <button
                type="button"
                disabled={dateDisabled}
                className={twMerge(
                  "relative z-[1] flex size-8 cursor-pointer items-center justify-center rounded hover:bg-[#f5f5f5]",
                  muted && "text-[#bbb] [&_*]:text-[#bbb]!",
                  selected && "bg-selected text-primary hover:bg-selected",
                  dateDisabled &&
                    "cursor-not-allowed bg-transparent text-[#bfbfbf] hover:bg-transparent [&_*]:text-[#bfbfbf]!",
                )}
                onClick={() => onSelect(date)}
              >
                {cellRender ? cellRender(dayjs(date), origin) : origin}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function sameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
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
        const monthValue = formatDate(date, "month");
        const selected = selectedValues.some((item) => item.startsWith(monthValue));
        const disabled = disabledDate(date);
        const origin = <>{month + 1}월</>;
        return (
          <button
            key={month}
            type="button"
            disabled={disabled}
            className={twMerge(
              "h-10 cursor-pointer rounded hover:bg-[#f5f5f5]",
              selected && "bg-selected text-primary hover:bg-selected",
              disabled && "cursor-not-allowed bg-[#f5f5f5] text-[#bfbfbf] hover:bg-[#f5f5f5]",
            )}
            onClick={() => onSelect(date)}
          >
            {cellRender ? cellRender(dayjs(date), origin) : origin}
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
        const selected = selectedValues.some((item) => item.startsWith(String(year)));
        const disabled = disabledDate(date);
        const origin = <>{year}</>;
        return (
          <button
            key={year}
            type="button"
            disabled={disabled}
            className={twMerge(
              "h-10 cursor-pointer rounded hover:bg-[#f5f5f5]",
              selected && "bg-selected text-primary hover:bg-selected",
              disabled && "cursor-not-allowed bg-[#f5f5f5] text-[#bfbfbf] hover:bg-[#f5f5f5]",
            )}
            onClick={() => onSelect(date)}
          >
            {cellRender ? cellRender(dayjs(date), origin) : origin}
          </button>
        );
      })}
    </div>
  );
}

function pickerPlaceholder(picker: DatePickerModeType) {
  if (picker === "year") return "연도를 선택하세요";
  if (picker === "month") return "월을 선택하세요";
  return "날짜를 선택하세요";
}

function panelTitle(date: Date, picker: DatePickerModeType) {
  if (picker === "year") {
    const start = Math.floor(date.getFullYear() / 12) * 12;
    return `${start} - ${start + 11}`;
  }
  if (picker === "month") return `${date.getFullYear()}년`;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function offsetPanelDate(date: Date, picker: DatePickerModeType, amount: number) {
  const next = new Date(date);
  if (picker === "year") next.setFullYear(next.getFullYear() + amount * 12);
  else if (picker === "month") next.setFullYear(next.getFullYear() + amount);
  else next.setMonth(next.getMonth() + amount);
  return next;
}

function DateRangePicker({
  value,
  defaultValue = [null, null],
  defaultPickerValue,
  pickerValue,
  picker = "date",
  placeholder = ["시작 날짜", "종료 날짜"],
  format,
  label,
  errorMessage,
  required = false,
  size = "md",
  variant = "default",
  presets,
  disabled = false,
  readOnly = false,
  allowClear = true,
  open,
  defaultOpen = false,
  placement = "bottomLeft",
  minDate,
  maxDate,
  showNow = false,
  disabledDate,
  cellRender,
  onChange,
  onCalendarChange,
  onClear,
  onPanelChange,
  className,
  width,
  onOpenChange,
}: DateRangePickerProps) {
  const serializeRange = (range: DateRangeValueType): InternalDateRangeValue => [
    range[0] ? toInternalValue(range[0], picker, false, false) : null,
    range[1] ? toInternalValue(range[1], picker, false, false) : null,
  ];
  const [innerValue, setInnerValue] = useState<InternalDateRangeValue>(() =>
    serializeRange(defaultValue),
  );
  const [selectionDraft, setSelectionDraft] = useState<InternalDateRangeValue | null>(null);
  const selectedValue =
    selectionDraft ?? (value === undefined ? innerValue : serializeRange(value));
  const initialPanel =
    parseDate(pickerValue) ??
    parseDate(defaultPickerValue) ??
    parseDate(selectedValue[0]) ??
    new Date();
  const [leftPanel, setLeftPanel] = useState(initialPanel);
  const [rightPanel, setRightPanel] = useState(() => offsetPanelDate(initialPanel, picker, 1));
  const [selecting, setSelecting] = useState<"start" | "end">(
    selectedValue[0] && !selectedValue[1] ? "end" : "start",
  );
  const floating = useFloatingLayer({
    placement,
    trigger: "click",
    targetGap: 2,
    disabled: disabled || readOnly,
    open,
    defaultOpen,
    onOpenChange: (nextOpen) => {
      if (nextOpen) {
        const initial =
          parseDate(pickerValue) ??
          parseDate(defaultPickerValue) ??
          parseDate(selectedValue[0]) ??
          new Date();
        const next = offsetPanelDate(initial, picker, 1);
        setLeftPanel(initial);
        setRightPanel(next);
        setSelecting(selectedValue[0] && !selectedValue[1] ? "end" : "start");
      }
      onOpenChange?.(nextOpen);
    },
  });
  const emitRange = (nextRange: InternalDateRangeValue) => {
    setSelectionDraft(null);
    if (value === undefined) setInnerValue(nextRange);
    onChange?.([
      nextRange[0] ? dayjs(nextRange[0]) : null,
      nextRange[1] ? dayjs(nextRange[1]) : null,
    ]);
  };
  const selectRangeDate = (date: Date) => {
    const min = parseDate(minDate);
    const max = parseDate(maxDate);
    if (Boolean(min && date < min) || Boolean(max && date > max) || disabledDate?.(dayjs(date)))
      return;
    const nextDate = formatDate(date, picker);
    if (selecting === "start" || !selectedValue[0] || selectedValue[1]) {
      const next: InternalDateRangeValue = [nextDate, null];
      if (value === undefined) setInnerValue(next);
      else setSelectionDraft(next);
      onCalendarChange?.([dayjs(nextDate), null], { range: "start" });
      setSelecting("end");
      return;
    }
    const startDate = selectedValue[0];
    const next: InternalDateRangeValue =
      startDate && nextDate < startDate ? [nextDate, startDate] : [startDate ?? nextDate, nextDate];
    emitRange(next);
    onCalendarChange?.([dayjs(next[0]!), dayjs(next[1]!)], { range: "end" });
    setSelecting("start");
    floating.changeOpen(false, "menu");
  };

  return (
    <div className={twMerge("flex w-full flex-col gap-1", className)} style={{ width }}>
      {label ? <Label label={label} required={required} size={size} /> : null}
      <span ref={floating.triggerRef} className="block w-full" {...floating.triggerProps}>
        <button
          type="button"
          disabled={disabled}
          className={pickerRootVariants({
            size,
            variant,
            error: Boolean(errorMessage),
            disabled,
            readOnly,
            interactive: !disabled && !readOnly,
          })}
        >
          <span className={twMerge("min-w-0 flex-1 truncate", !selectedValue[0] && "text-[#999]")}>
            {selectedValue[0] ? formatDisplayValue(selectedValue[0], format) : placeholder[0]}
          </span>
          <span data-datepicker-range-separator className="shrink-0">
            <Icon icon="arrow-right" size={12} color="#999" />
          </span>
          <span className={twMerge("min-w-0 flex-1 truncate", !selectedValue[1] && "text-[#999]")}>
            {selectedValue[1] ? formatDisplayValue(selectedValue[1], format) : placeholder[1]}
          </span>
          {allowClear && (selectedValue[0] || selectedValue[1]) && !disabled && !readOnly ? (
            <span
              className="cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                emitRange([null, null]);
                const initial =
                  parseDate(pickerValue) ?? parseDate(defaultPickerValue) ?? new Date();
                setLeftPanel(initial);
                setRightPanel(offsetPanelDate(initial, picker, 1));
                setSelecting("start");
                onClear?.();
              }}
            >
              <Icon icon="close" color="#999" />
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
              data-datepicker-range-popup
              className={twMerge(
                "fixed overflow-hidden rounded-lg bg-white font-pretendard text-sm text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.06),0_3px_6px_-4px_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.03)]",
                !floating.isMotionVisible && "pointer-events-none",
              )}
              style={{
                left: floating.position?.left ?? 0,
                top: floating.position?.top ?? 0,
                zIndex: 1050,
                visibility: floating.position ? "visible" : "hidden",
                ...getPopupMotionStyle(
                  floating.position?.placement ?? placement,
                  floating.isMotionVisible && Boolean(floating.position),
                ),
              }}
              {...floating.popupProps}
            >
              <div className="grid grid-cols-2">
                <div className="w-[296px] p-3">
                  <PickerPanel
                    picker={picker}
                    panelDate={leftPanel}
                    nextButton={false}
                    selectedValues={selectedValue.filter(Boolean) as string[]}
                    rangeValues={selectedValue}
                    disabledDate={(date) => {
                      const min = parseDate(minDate);
                      const max = parseDate(maxDate);
                      return (
                        Boolean(min && date < min) ||
                        Boolean(max && date > max) ||
                        Boolean(disabledDate?.(dayjs(date)))
                      );
                    }}
                    cellRender={cellRender}
                    onPanelDateChange={(next) => {
                      setLeftPanel(next);
                      const right = offsetPanelDate(next, picker, 1);
                      setRightPanel(right);
                      onPanelChange?.(dayjs(next), picker);
                    }}
                    onSelect={selectRangeDate}
                  />
                </div>
                <div className="w-[296px] p-3">
                  <PickerPanel
                    picker={picker}
                    panelDate={rightPanel}
                    previousButton={false}
                    selectedValues={selectedValue.filter(Boolean) as string[]}
                    rangeValues={selectedValue}
                    disabledDate={(date) => {
                      const min = parseDate(minDate);
                      const max = parseDate(maxDate);
                      return (
                        Boolean(min && date < min) ||
                        Boolean(max && date > max) ||
                        Boolean(disabledDate?.(dayjs(date)))
                      );
                    }}
                    cellRender={cellRender}
                    onPanelDateChange={(next) => {
                      setRightPanel(next);
                      const left = offsetPanelDate(next, picker, -1);
                      setLeftPanel(left);
                      onPanelChange?.(dayjs(next), picker);
                    }}
                    onSelect={selectRangeDate}
                  />
                </div>
              </div>
              {presets?.length || showNow ? (
                <div className="px-3 pb-3">
                  <PickerFooter
                    presets={presets}
                    showNow={showNow}
                    onPresetSelect={(index) => {
                      const preset = presets?.[index];
                      if (!preset) return;
                      const nextRange =
                        typeof preset.value === "function" ? preset.value() : preset.value;
                      emitRange(serializeRange(nextRange));
                      floating.changeOpen(false, "menu");
                    }}
                    onNow={() => selectRangeDate(new Date())}
                  />
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

type DatePickerComponent = typeof BaseDatePicker & { RangePicker: typeof DateRangePicker };

export const DatePicker = Object.assign(BaseDatePicker, {
  RangePicker: DateRangePicker,
}) as DatePickerComponent;

const pickerRootVariants = cva(
  "flex w-full cursor-pointer items-center gap-2 rounded border border-solid px-2.5 text-left font-pretendard font-medium text-[#111] transition-colors focus:border-primary focus:outline-none",
  {
    variants: {
      size: { lg: "min-h-10 text-base", md: "min-h-[30px] text-sm" },
      variant: {
        default: "border-[#ddd] bg-white",
        filled: "border-[#f5f5f5] bg-[#f5f5f5]",
      },
      error: { true: "border-danger", false: "" },
      readOnly: {
        true: "cursor-default",
        false: "",
      },
      interactive: { true: "hover:border-primary", false: "" },
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
      interactive: true,
    },
  },
);
