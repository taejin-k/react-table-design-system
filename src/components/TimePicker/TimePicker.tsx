import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { useErrorMessageValidation } from "../_internal/useErrorMessageValidation";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type { TimePickerProps } from "./TimePicker.types";

export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

const multipleTagSizeClasses = {
  lg: "h-8",
  md: "h-[22px]",
} as const;
type TimePickerLayoutPosition = { left: number; top: number };

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
  return resolveSelectableTime(
    { hour: use12Hours ? 1 : 0, minute: 0, second: 0 },
    { use12Hours, showSecond, hourStep, minuteStep, secondStep, disabledTime },
  );
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

export function resolveSelectableTime(
  preferred: TimeParts,
  {
    use12Hours,
    showSecond,
    hourStep,
    minuteStep,
    secondStep,
    disabledTime,
  }: Pick<
    TimePickerProps,
    "use12Hours" | "showSecond" | "hourStep" | "minuteStep" | "secondStep" | "disabledTime"
  >,
): TimeParts {
  const disabled = disabledTime?.(dayjs()) ?? {};
  const displayedHours = numberSteps(use12Hours ? 13 : 24, hourStep ?? 1, use12Hours ? 1 : 0);
  const availableHours = use12Hours
    ? [
        ...displayedHours.map((hour) => toTwentyFourHour(hour, false)),
        ...displayedHours.map((hour) => toTwentyFourHour(hour, true)),
      ]
    : displayedHours;
  const allowedHours = Array.from(new Set(availableHours))
    .filter((hour) => !(disabled.disabledHours?.() ?? []).includes(hour))
    .sort((first, second) => first - second);
  const hours = allowedHours.includes(preferred.hour)
    ? [preferred.hour, ...allowedHours.filter((hour) => hour !== preferred.hour)]
    : allowedHours;
  const minuteValues = numberSteps(60, minuteStep ?? 1);
  const secondValues = numberSteps(60, secondStep ?? 1);

  for (const hour of hours) {
    const allowedMinutes = minuteValues.filter(
      (minute) => !(disabled.disabledMinutes?.(hour) ?? []).includes(minute),
    );
    const minutes = allowedMinutes.includes(preferred.minute)
      ? [preferred.minute, ...allowedMinutes.filter((minute) => minute !== preferred.minute)]
      : allowedMinutes;
    for (const minute of minutes) {
      if (!showSecond) return { hour, minute, second: 0 };
      const allowedSeconds = secondValues.filter(
        (second) => !(disabled.disabledSeconds?.(hour, minute) ?? []).includes(second),
      );
      const second = allowedSeconds.includes(preferred.second)
        ? preferred.second
        : allowedSeconds[0];
      if (second !== undefined) return { hour, minute, second };
    }
  }

  return preferred;
}

function BaseTimePicker(props: TimePickerProps<boolean>) {
  const {
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
    needConfirm = multiple,
    disabledTime,
    hideDisabled = false,
    showNow = true,
    cellRender,
    format,
    open,
    defaultOpen = false,
    placement = "bottomLeft",
    className,
    onChange,
    onClear,
    onOpenChange,
  } = props;
  const isControlled = Object.prototype.hasOwnProperty.call(props, "value");
  const [innerValues, setInnerValues] = useState<Dayjs[]>(() => normalizeValues(defaultValue));
  const sourceValues = isControlled ? normalizeValues(value) : innerValues;
  const selectedValues = order
    ? [...sourceValues].sort((first, second) =>
        timeValueKey(first, true).localeCompare(timeValueKey(second, true)),
      )
    : sourceValues;
  const selectedValuesKey = selectedValues.map((item) => timeValueKey(item, true)).join("\u0000");
  const initialValidationValue = multiple ? selectedValues : selectedValues[0];
  const { displayedErrorMessage, hasError, validateErrorMessage } = useErrorMessageValidation(
    errorMessage,
    initialValidationValue,
  );
  const selectedValue = sourceValues[multiple ? sourceValues.length - 1 : 0] ?? null;
  const resolvedShowSecond = showSecond && (!format || format.includes("s"));
  const resolvedNeedConfirm = needConfirm;
  const multipleTriggerRef = useRef<HTMLButtonElement>(null);
  const multipleTagContainerRef = useRef<HTMLSpanElement>(null);
  const previousMultipleHeightRef = useRef<number | null>(null);
  const multipleHeightAnimationRef = useRef<Animation | null>(null);
  const previousMultipleLayoutRectsRef = useRef(new Map<string, TimePickerLayoutPosition>());
  const multipleLayoutAnimationsRef = useRef(
    new Map<string, { element: HTMLElement; animation: Animation }>(),
  );
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
  const [panelResetKey, setPanelResetKey] = useState(0);
  const floating = useFloatingLayer({
    placement,
    recoverOnPopupResize: true,
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
    if (!isControlled) setInnerValues(normalizedValues);
    const outputValue = multiple ? normalizedValues : normalizedValues[0];
    validateErrorMessage(outputValue);
    if (multiple) {
      onChange?.(
        normalizedValues,
        normalizedValues.map((item) =>
          formatDisplayTime(item, format, use12Hours, resolvedShowSecond),
        ),
      );
      return;
    }
    const nextValue = normalizedValues[0];
    onChange?.(
      nextValue,
      nextValue ? formatDisplayTime(nextValue, format, use12Hours, resolvedShowSecond) : "",
    );
  };

  const commitTime = (parts: TimeParts | null) => {
    if (parts && isTimeDisabled(parts, disabledTime, resolvedShowSecond)) return;
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
    const resolvedParts = resolveSelectableTime(nextParts, {
      use12Hours,
      showSecond: resolvedShowSecond,
      hourStep,
      minuteStep,
      secondStep,
      disabledTime,
    });
    setPending(resolvedParts);
    if (!resolvedNeedConfirm) commitTime(resolvedParts);
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
    )
      return;
    const animation = trigger.animate(
      [
        { height: `${renderedHeight ?? previousHeight}px`, overflow: "clip" },
        { height: `${nextHeight}px`, overflow: "clip" },
      ],
      { duration: 300, easing: "cubic-bezier(0.645, 0.045, 0.355, 1)" },
    );
    multipleHeightAnimationRef.current = animation;
    animation.addEventListener("finish", () => {
      if (multipleHeightAnimationRef.current === animation)
        multipleHeightAnimationRef.current = null;
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
      container.querySelectorAll<HTMLElement>("[data-timepicker-layout-key]"),
    );
    const renderedRects = new Map<string, TimePickerLayoutPosition>();
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
    const nextRects = new Map<string, TimePickerLayoutPosition>();
    const nextContainerRect = container.getBoundingClientRect();
    elements.forEach((element) => {
      const key = element.dataset.timepickerLayoutKey;
      if (!key) return;
      const rect = element.getBoundingClientRect();
      nextRects.set(key, {
        left: rect.left - nextContainerRect.left,
        top: rect.top - nextContainerRect.top,
      });
    });
    const previousRects = previousMultipleLayoutRectsRef.current;
    previousMultipleLayoutRectsRef.current = nextRects;
    if (previousRects.size === 0 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return;
    elements.forEach((element) => {
      const key = element.dataset.timepickerLayoutKey;
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
        { duration: 300, easing: "cubic-bezier(0.645, 0.045, 0.355, 1)" },
      );
      multipleLayoutAnimationsRef.current.set(key, { element, animation });
      animation.addEventListener("finish", () => {
        if (multipleLayoutAnimationsRef.current.get(key)?.animation === animation)
          multipleLayoutAnimationsRef.current.delete(key);
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
      const nextRects = new Map<string, TimePickerLayoutPosition>();
      container.querySelectorAll<HTMLElement>("[data-timepicker-layout-key]").forEach((element) => {
        const key = element.dataset.timepickerLayoutKey;
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
    <div className={twMerge("flex w-full flex-col gap-1", className)}>
      {label ? <Label label={label} required={required} size={size} /> : null}
      <span
        ref={floating.triggerRef}
        className="block w-full"
        style={{ width }}
        {...floating.triggerProps}
      >
        <button
          ref={multipleTriggerRef}
          type="button"
          disabled={disabled}
          className={twMerge(
            timePickerRootVariants({
              size,
              variant,
              error: hasError,
              disabled,
              readOnly,
              interactive: !disabled && !readOnly,
            }),
            multiple &&
              selectedValues.length > 0 && [
                "h-auto items-start",
                size === "lg" && "min-h-10 py-[3px] pl-[3px]",
                size === "md" && "min-h-[30px] py-[3px] pl-[3px]",
              ],
          )}
          onMouseDown={(event) => {
            if (readOnly) event.preventDefault();
          }}
        >
          {multiple && selectedValues.length > 0 ? (
            <span
              ref={multipleTagContainerRef}
              className="flex min-w-0 flex-1 flex-wrap items-center gap-[5px]"
            >
              {selectedValues.map((item) => {
                const itemKey = timeValueKey(item, resolvedShowSecond);
                return (
                  <Tag
                    key={itemKey}
                    data-timepicker-tag
                    data-timepicker-layout-key={`tag:${itemKey}`}
                    color="gray"
                    variant="filled"
                    className={twMerge(
                      multipleTagSizeClasses[size],
                      "tabular-nums",
                      variant === "filled" && "bg-white",
                      disabled && "bg-white text-disabled",
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
            <span
              className={twMerge("min-w-0 flex-1 truncate", !displayedValue && "text-disabled")}
            >
              {displayedValue ?? placeholder}
            </span>
          )}
          {allowClear && selectedValues.length > 0 && !disabled && !readOnly ? (
            <span
              className="cursor-pointer self-center transition-opacity duration-200 ease-out hover:opacity-75 motion-reduce:transition-none"
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
                setPanelResetKey((current) => current + 1);
                onClear?.();
              }}
            >
              <Icon icon="close" color="gray" />
            </span>
          ) : (
            <Icon icon="clock-outlined" color="disabled" />
          )}
        </button>
      </span>
      <ErrorMessage errorMessage={displayedErrorMessage} />
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
                disabledTime={disabledTime}
                hideDisabled={hideDisabled}
                cellRender={cellRender}
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
                      disabled={isTimeDisabled(pending, disabledTime, resolvedShowSecond)}
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
                  "h-8 w-full shrink-0 cursor-pointer rounded transition-colors duration-200 ease-out outline-none hover:bg-hover motion-reduce:transition-none",
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
  onSelect,
}: {
  values: number[];
  selected: number;
  disabledValues?: number[];
  hideDisabled?: boolean;
  changeOnScroll?: boolean;
  cellRender?: TimePickerProps["cellRender"];
  subType: "hour" | "minute" | "second";
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
              "h-8 w-full shrink-0 cursor-pointer rounded transition-colors duration-200 ease-out outline-none hover:bg-hover motion-reduce:transition-none",
              selected === value && "bg-selected font-medium text-primary hover:bg-selected",
              valueDisabled && "cursor-not-allowed text-disabled hover:bg-transparent",
            )}
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

export const TimePicker = BaseTimePicker as <Multiple extends boolean = false>(
  props: TimePickerProps<Multiple>,
) => React.ReactNode;

const timePickerRootVariants = cva(
  "flex w-full items-center gap-2 rounded border border-solid px-2.5 text-left font-pretendard font-medium text-dark transition-colors duration-200 ease-out outline-none hover:border-primary focus:border-primary motion-reduce:transition-none",
  {
    variants: {
      size: { lg: "h-10 text-base", md: "h-[30px] text-sm" },
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
        true: "cursor-not-allowed border-border bg-hover text-disabled hover:border-border",
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
