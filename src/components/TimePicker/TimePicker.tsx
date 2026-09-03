import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import dayjs, { type Dayjs } from "dayjs";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { ErrorMessage } from "../ErrorMessage";
import { Icon } from "../Icon";
import { Label } from "../Label";
import { Tag } from "../Tag";
import { ScrollFade } from "../_internal/ScrollFade";
import { getPopupMotionStyle } from "../_internal/motion";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type { TimePickerProps } from "./TimePicker.types";

interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

const multipleTagSizeClasses = {
  lg: "h-8",
  md: "h-[22px]",
  sm: "h-4 px-1 text-[10px]",
} as const;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseTime(value?: unknown): TimeParts {
  if (!value) return { hour: 0, minute: 0, second: 0 };
  if (dayjs.isDayjs(value)) {
    return { hour: value.hour(), minute: value.minute(), second: value.second() };
  }
  if (typeof value !== "string") return { hour: 0, minute: 0, second: 0 };
  const [hour = 0, minute = 0, second = 0] = value.split(":").map(Number);
  return { hour, minute, second };
}

function formatTime(parts: TimeParts, showSecond: boolean) {
  return `${pad(parts.hour)}:${pad(parts.minute)}${showSecond ? `:${pad(parts.second)}` : ""}`;
}

function timeValueKey(value: Dayjs, showSecond: boolean) {
  return formatTime(parseTime(value), showSecond);
}

function formatDisplayTime(
  value: Dayjs,
  format: string | undefined,
  use12Hours: boolean,
  showSecond: boolean,
) {
  if (format) return value.format(format);
  return use12Hours
    ? formatTwelveHours(value, showSecond)
    : formatTime(parseTime(value), showSecond);
}

function normalizeTimeValue(value: unknown) {
  if (dayjs.isDayjs(value)) return value.isValid() ? value : null;
  if (value instanceof Date) {
    const normalizedValue = dayjs(value);
    return normalizedValue.isValid() ? normalizedValue : null;
  }
  if (typeof value !== "string") return null;
  const [hour, minute = 0, second = 0] = value.split(":").map(Number);
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    !Number.isInteger(second) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }
  return dayjs().hour(hour).minute(minute).second(second).millisecond(0);
}

function normalizeValues(value?: unknown) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.map(normalizeTimeValue).filter((item): item is Dayjs => item !== null);
}

function resolveInitialTime({
  use12Hours,
  showSecond,
  hourStep,
  minuteStep,
  secondStep,
  disabledTime,
}: Pick<
  TimePickerProps,
  "use12Hours" | "showSecond" | "hourStep" | "minuteStep" | "secondStep" | "disabledTime"
>): TimeParts {
  const disabled = disabledTime?.(dayjs()) ?? {};
  const disabledHours = disabled.disabledHours?.() ?? [];
  const hourValues = use12Hours
    ? numberSteps(13, hourStep ?? 1, 1).map((hour) => toTwentyFourHour(hour, false))
    : numberSteps(24, hourStep ?? 1);
  const hour = hourValues.find((value) => !disabledHours.includes(value)) ?? hourValues[0] ?? 0;
  const disabledMinutes = disabled.disabledMinutes?.(hour) ?? [];
  const minuteValues = numberSteps(60, minuteStep ?? 1);
  const minute =
    minuteValues.find((value) => value === 0 && !disabledMinutes.includes(value)) ??
    minuteValues.find((value) => !disabledMinutes.includes(value)) ??
    0;
  const disabledSeconds = disabled.disabledSeconds?.(hour, minute) ?? [];
  const secondValues = numberSteps(60, secondStep ?? 1);
  const second = showSecond
    ? (secondValues.find((value) => value === 0 && !disabledSeconds.includes(value)) ??
      secondValues.find((value) => !disabledSeconds.includes(value)) ??
      0)
    : 0;

  return { hour, minute, second };
}

function isTimeDisabled(
  parts: TimeParts,
  disabledTime: TimePickerProps["disabledTime"],
  showSecond: boolean,
) {
  const value = dayjs()
    .hour(parts.hour)
    .minute(parts.minute)
    .second(showSecond ? parts.second : 0)
    .millisecond(0);
  const disabled = disabledTime?.(value) ?? {};
  return (
    (disabled.disabledHours?.() ?? []).includes(parts.hour) ||
    (disabled.disabledMinutes?.(parts.hour) ?? []).includes(parts.minute) ||
    (showSecond &&
      (disabled.disabledSeconds?.(parts.hour, parts.minute) ?? []).includes(parts.second))
  );
}

function BaseTimePicker({
  value,
  defaultValue,
  placeholder = "시간을 선택하세요",
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
  use12Hours = false,
  showSecond = true,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  needConfirm = false,
  changeOnScroll = false,
  disabledTime,
  hideDisabled = false,
  showNow = true,
  previewValue = false,
  cellRender,
  format,
  open,
  defaultOpen = false,
  placement = "bottomLeft",
  className,
  onChange,
  onClear,
  onOpenChange,
}: TimePickerProps) {
  const [innerValues, setInnerValues] = useState<Dayjs[]>(() => normalizeValues(defaultValue));
  const sourceValues = value === undefined ? innerValues : normalizeValues(value);
  const selectedValues = order
    ? [...sourceValues].sort((first, second) =>
        timeValueKey(first, true).localeCompare(timeValueKey(second, true)),
      )
    : sourceValues;
  const selectedValue = sourceValues[multiple ? sourceValues.length - 1 : 0] ?? null;
  const resolvedShowSecond = showSecond && (!format || format.includes("s"));
  const resolvedNeedConfirm = needConfirm || multiple;
  const initialPanelTime = () =>
    selectedValue
      ? parseTime(selectedValue)
      : resolveInitialTime({
          use12Hours,
          showSecond: resolvedShowSecond,
          hourStep,
          minuteStep,
          secondStep,
          disabledTime,
        });
  const [pending, setPending] = useState<TimeParts>(initialPanelTime);
  const [preview, setPreview] = useState<TimeParts | null>(null);
  const [panelResetKey, setPanelResetKey] = useState(0);
  const floating = useFloatingLayer({
    placement,
    trigger: "click",
    targetGap: 2,
    disabled: disabled || readOnly,
    open,
    defaultOpen,
    onOpenChange: (nextOpen) => {
      if (nextOpen) setPending(initialPanelTime());
      onOpenChange?.(nextOpen);
    },
  });

  const emitValues = (nextValues: Dayjs[]) => {
    const normalizedValues = order
      ? [...nextValues].sort((first, second) =>
          timeValueKey(first, true).localeCompare(timeValueKey(second, true)),
        )
      : nextValues;
    if (value === undefined) setInnerValues(normalizedValues);
    if (multiple) {
      onChange?.(
        normalizedValues,
        normalizedValues.map((item) =>
          formatDisplayTime(item, format, use12Hours, resolvedShowSecond),
        ),
      );
      return;
    }
    const nextValue = normalizedValues[0] ?? null;
    onChange?.(
      nextValue,
      nextValue ? formatDisplayTime(nextValue, format, use12Hours, resolvedShowSecond) : "",
    );
  };

  const commitTime = (parts: TimeParts | null) => {
    if (!parts) {
      emitValues([]);
      return;
    }
    const nextValue = (selectedValue ?? dayjs())
      .hour(parts.hour)
      .minute(parts.minute)
      .second(resolvedShowSecond ? parts.second : 0)
      .millisecond(0);
    if (!multiple) {
      emitValues([nextValue]);
      return;
    }
    const nextKey = timeValueKey(nextValue, resolvedShowSecond);
    const exists = selectedValues.some(
      (item) => timeValueKey(item, resolvedShowSecond) === nextKey,
    );
    emitValues(
      exists
        ? selectedValues.filter((item) => timeValueKey(item, resolvedShowSecond) !== nextKey)
        : [...selectedValues, nextValue],
    );
  };

  const selectParts = (nextParts: TimeParts) => {
    setPending(nextParts);
    if (!resolvedNeedConfirm) commitTime(nextParts);
  };

  const displayedValue = selectedValue
    ? formatDisplayTime(selectedValue, format, use12Hours, resolvedShowSecond)
    : null;
  const now = new Date();
  const nowParts = {
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
  };
  const nowDisabled = isTimeDisabled(nowParts, disabledTime, resolvedShowSecond);

  return (
    <div className={twMerge("flex w-full flex-col gap-1", className)} style={{ width }}>
      {label ? <Label label={label} required={required} size={size} /> : null}
      <span ref={floating.triggerRef} className="block w-full" {...floating.triggerProps}>
        <button
          type="button"
          disabled={disabled}
          className={twMerge(
            timePickerRootVariants({
              size,
              variant,
              error: Boolean(errorMessage),
              disabled,
              readOnly,
              interactive: !disabled && !readOnly,
            }),
            multiple &&
              selectedValues.length > 0 && [
                "h-auto items-start",
                size === "lg" && "min-h-10 py-[3px] pl-[3px]",
                size === "md" && "min-h-[30px] py-[3px] pl-[3px]",
                size === "sm" && "min-h-5 py-0.5 pl-0.5",
              ],
          )}
        >
          {multiple && selectedValues.length > 0 ? (
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-[5px]">
              {selectedValues.map((item) => {
                const itemKey = timeValueKey(item, resolvedShowSecond);
                return (
                  <Tag
                    key={itemKey}
                    data-timepicker-tag
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
                            emitValues(
                              selectedValues.filter(
                                (value) => timeValueKey(value, resolvedShowSecond) !== itemKey,
                              ),
                            );
                          }}
                        />
                      )
                    }
                  >
                    {formatDisplayTime(item, format, use12Hours, resolvedShowSecond)}
                  </Tag>
                );
              })}
            </span>
          ) : (
            <span className={twMerge("min-w-0 flex-1 truncate", !displayedValue && "text-gray")}>
              {preview && previewValue === "hover"
                ? formatDisplayTime(
                    dayjs().hour(preview.hour).minute(preview.minute).second(preview.second),
                    format,
                    use12Hours,
                    resolvedShowSecond,
                  )
                : (displayedValue ?? placeholder)}
            </span>
          )}
          {allowClear && selectedValues.length > 0 && !disabled && !readOnly ? (
            <span
              className="cursor-pointer self-center"
              onClick={(event) => {
                event.stopPropagation();
                commitTime(null);
                setPending(
                  resolveInitialTime({
                    use12Hours,
                    showSecond: resolvedShowSecond,
                    hourStep,
                    minuteStep,
                    secondStep,
                    disabledTime,
                  }),
                );
                setPreview(null);
                setPanelResetKey((current) => current + 1);
                onClear?.();
              }}
            >
              {typeof allowClear === "object" && allowClear.clearIcon ? (
                allowClear.clearIcon
              ) : (
                <Icon icon="close" color="gray" />
              )}
            </span>
          ) : (
            <Icon icon="clock-outlined" color="gray" />
          )}
        </button>
      </span>
      <ErrorMessage errorMessage={errorMessage} />
      {floating.isRendered && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={floating.popupRef}
              data-timepicker-popup
              className={twMerge(
                "fixed overflow-hidden rounded-lg bg-white font-pretendard text-sm text-dark shadow-xl motion-reduce:transition-none",
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
              <TimePanel
                key={panelResetKey}
                value={formatTime(pending, true)}
                use12Hours={use12Hours}
                showSecond={resolvedShowSecond}
                hourStep={hourStep}
                minuteStep={minuteStep}
                secondStep={secondStep}
                changeOnScroll={changeOnScroll}
                disabledTime={disabledTime}
                hideDisabled={hideDisabled}
                cellRender={cellRender}
                onPreview={setPreview}
                onChange={selectParts}
              />
              {showNow || resolvedNeedConfirm ? (
                <div className="flex min-h-10 items-center justify-between gap-2 border-t border-hover px-2 py-1">
                  {showNow ? (
                    <Button
                      disabled={nowDisabled}
                      variant="ghost"
                      onClick={() => {
                        setPending(nowParts);
                        commitTime(nowParts);
                        floating.changeOpen(false, "menu");
                      }}
                    >
                      지금
                    </Button>
                  ) : (
                    <span />
                  )}
                  {resolvedNeedConfirm ? (
                    <Button
                      onClick={() => {
                        commitTime(pending);
                        floating.changeOpen(false, "menu");
                      }}
                    >
                      확인
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

interface TimePanelProps {
  value: string;
  className?: string;
  use12Hours?: boolean;
  showSecond?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  changeOnScroll?: boolean;
  disabledTime?: TimePickerProps["disabledTime"];
  hideDisabled?: boolean;
  cellRender?: TimePickerProps["cellRender"];
  onPreview?: (value: TimeParts | null) => void;
  onChange: (value: TimeParts) => void;
}

export function TimePanel({
  value,
  className,
  use12Hours = false,
  showSecond = true,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  changeOnScroll = false,
  disabledTime,
  hideDisabled = false,
  cellRender,
  onPreview,
  onChange,
}: TimePanelProps) {
  const selected = parseTime(value);
  const disabledConfig = disabledTime?.(dayjs()) ?? {};
  const disabledHours = disabledConfig.disabledHours?.() ?? [];
  const isPm = selected.hour >= 12;

  return (
    <div className={twMerge("flex h-56 divide-x divide-hover", className)}>
      <TimeColumn
        values={numberSteps(use12Hours ? 13 : 24, hourStep, use12Hours ? 1 : 0)}
        selected={use12Hours ? twelveHour(selected.hour) : selected.hour}
        disabledValues={
          use12Hours
            ? numberSteps(13, hourStep, 1).filter((hour) =>
                disabledHours.includes(toTwentyFourHour(hour, isPm)),
              )
            : disabledHours
        }
        hideDisabled={hideDisabled}
        changeOnScroll={changeOnScroll}
        cellRender={cellRender}
        subType="hour"
        onPreview={(hour) =>
          onPreview?.(
            hour === null
              ? null
              : {
                  ...selected,
                  hour: use12Hours ? toTwentyFourHour(hour, selected.hour >= 12) : hour,
                },
          )
        }
        onSelect={(hour) =>
          onChange({
            ...selected,
            hour: use12Hours ? toTwentyFourHour(hour, selected.hour >= 12) : hour,
          })
        }
      />
      <TimeColumn
        values={numberSteps(60, minuteStep)}
        selected={selected.minute}
        disabledValues={disabledConfig.disabledMinutes?.(selected.hour) ?? []}
        hideDisabled={hideDisabled}
        changeOnScroll={changeOnScroll}
        cellRender={cellRender}
        subType="minute"
        onPreview={(minute) => onPreview?.(minute === null ? null : { ...selected, minute })}
        onSelect={(minute) => onChange({ ...selected, minute })}
      />
      {showSecond ? (
        <TimeColumn
          values={numberSteps(60, secondStep)}
          selected={selected.second}
          disabledValues={disabledConfig.disabledSeconds?.(selected.hour, selected.minute) ?? []}
          hideDisabled={hideDisabled}
          changeOnScroll={changeOnScroll}
          cellRender={cellRender}
          subType="second"
          onPreview={(second) => onPreview?.(second === null ? null : { ...selected, second })}
          onSelect={(second) => onChange({ ...selected, second })}
        />
      ) : null}
      {use12Hours ? (
        <ScrollFade className="w-16" viewportClassName="flex flex-col gap-1 p-1" fadeSize={48}>
          {["AM", "PM"].map((meridiem) => {
            const isSelected = (selected.hour >= 12 ? "PM" : "AM") === meridiem;
            const nextHour = toTwentyFourHour(twelveHour(selected.hour), meridiem === "PM");
            const disabled = disabledHours.includes(nextHour);
            return (
              <button
                key={meridiem}
                type="button"
                disabled={disabled}
                className={twMerge(
                  "h-8 w-full shrink-0 cursor-pointer rounded hover:bg-hover",
                  isSelected && "bg-selected text-primary hover:bg-selected",
                  disabled && "cursor-not-allowed text-disabled hover:bg-transparent",
                )}
                onClick={() =>
                  onChange({
                    ...selected,
                    hour: nextHour,
                  })
                }
              >
                {meridiem}
              </button>
            );
          })}
        </ScrollFade>
      ) : null}
    </div>
  );
}

function TimeColumn({
  values,
  selected,
  disabledValues = [],
  hideDisabled = false,
  changeOnScroll = false,
  cellRender,
  subType,
  onPreview,
  onSelect,
}: {
  values: number[];
  selected: number;
  disabledValues?: number[];
  hideDisabled?: boolean;
  changeOnScroll?: boolean;
  cellRender?: TimePickerProps["cellRender"];
  subType: "hour" | "minute" | "second";
  onPreview?: (value: number | null) => void;
  onSelect: (value: number) => void;
}) {
  const visibleValues = hideDisabled
    ? values.filter((value) => !disabledValues.includes(value))
    : values;
  const viewportRef = useRef<HTMLDivElement>(null);
  const selectedIndex = visibleValues.indexOf(selected);
  const initialSelectedIndex = useRef(selectedIndex).current;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || initialSelectedIndex < 0) return;
    const centeredScrollTop =
      initialSelectedIndex * 36 - Math.max((viewport.clientHeight - 32) / 2, 0);
    const maxScrollTop = Math.max(viewport.scrollHeight - viewport.clientHeight, 0);
    viewport.scrollTop = Math.max(
      0,
      maxScrollTop > 0 ? Math.min(centeredScrollTop, maxScrollTop) : centeredScrollTop,
    );
  }, [initialSelectedIndex]);

  return (
    <ScrollFade
      ref={viewportRef}
      data-time-column={subType}
      className="w-14"
      viewportClassName="flex flex-col gap-1 p-1"
      fadeSize={48}
      onScroll={(event) => {
        if (!changeOnScroll) return;
        const index = Math.round(event.currentTarget.scrollTop / 36);
        const nextValue = visibleValues[index];
        if (nextValue !== undefined && !disabledValues.includes(nextValue)) onSelect(nextValue);
      }}
      onMouseLeave={() => onPreview?.(null)}
    >
      {visibleValues.map((value) => {
        const valueDisabled = disabledValues.includes(value);
        const originNode = <>{pad(value)}</>;
        return (
          <button
            key={value}
            type="button"
            disabled={valueDisabled}
            className={twMerge(
              "h-8 w-full shrink-0 cursor-pointer rounded hover:bg-hover",
              selected === value && "bg-selected font-medium text-primary hover:bg-selected",
              valueDisabled && "cursor-not-allowed text-disabled hover:bg-transparent",
            )}
            onMouseEnter={() => onPreview?.(value)}
            onClick={() => onSelect(value)}
          >
            {cellRender ? cellRender(value, { originNode, subType }) : originNode}
          </button>
        );
      })}
    </ScrollFade>
  );
}

function numberSteps(length: number, step: number, start = 0) {
  return Array.from(
    { length: Math.ceil((length - start) / Math.max(step, 1)) },
    (_, index) => start + index * Math.max(step, 1),
  );
}

function twelveHour(hour: number) {
  return hour % 12 || 12;
}

function toTwentyFourHour(hour: number, isPm: boolean) {
  return (hour % 12) + (isPm ? 12 : 0);
}

function formatTwelveHours(value: string | Dayjs, showSecond: boolean) {
  const parts = parseTime(value);
  return `${pad(twelveHour(parts.hour))}:${pad(parts.minute)}${showSecond ? `:${pad(parts.second)}` : ""} ${parts.hour >= 12 ? "PM" : "AM"}`;
}

export const TimePicker = BaseTimePicker;

const timePickerRootVariants = cva(
  "flex w-full items-center gap-2 rounded border border-solid px-2.5 text-left font-pretendard font-medium text-dark transition-colors hover:border-primary focus:border-primary focus:outline-none",
  {
    variants: {
      size: { lg: "h-10 text-base", md: "h-[30px] text-sm", sm: "h-5 text-xs" },
      variant: {
        default: "border-border bg-white",
        filled: "border-hover bg-hover",
      },
      error: { true: "border-danger", false: "" },
      readOnly: {
        true: "cursor-default hover:border-border",
        false: "",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
      disabled: {
        true: "cursor-not-allowed border-border bg-hover text-gray hover:border-border",
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
    compoundVariants: [
      {
        variant: "filled",
        readOnly: true,
        className: "hover:border-hover",
      },
    ],
  },
);
