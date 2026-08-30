import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { ErrorMessage } from "../ErrorMessage";
import { Icon } from "../Icon";
import { Label } from "../Label";
import { ScrollFade } from "../_internal/ScrollFade";
import { getPopupMotionStyle } from "../_internal/motion";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type { TimePickerProps } from "./TimePicker.types";

interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseTime(value?: string | null): TimeParts {
  if (!value) return { hour: 0, minute: 0, second: 0 };
  const [hour = 0, minute = 0, second = 0] = (value ?? "").split(":").map(Number);
  return { hour, minute, second };
}

function formatTime(parts: TimeParts, showSecond: boolean) {
  return `${pad(parts.hour)}:${pad(parts.minute)}${showSecond ? `:${pad(parts.second)}` : ""}`;
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
  | "use12Hours"
  | "showSecond"
  | "hourStep"
  | "minuteStep"
  | "secondStep"
  | "disabledTime"
>): TimeParts {
  const disabled = disabledTime?.(new Date()) ?? {};
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
  renderExtraFooter,
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
  const [innerValue, setInnerValue] = useState<string | null>(defaultValue ?? null);
  const selectedValue = value === undefined ? innerValue : value;
  const resolvedShowSecond = showSecond && format !== "HH:mm" && format !== "hh:mm A";
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

  const commitTime = (parts: TimeParts | null) => {
    const nextValue = parts ? formatTime(parts, resolvedShowSecond) : null;
    if (value === undefined) setInnerValue(nextValue);
    onChange?.(nextValue, nextValue ?? "");
  };

  const selectParts = (nextParts: TimeParts) => {
    setPending(nextParts);
    if (!needConfirm) commitTime(nextParts);
  };

  const displayedValue = selectedValue
    ? use12Hours
      ? formatTwelveHours(selectedValue, resolvedShowSecond)
      : formatTime(parseTime(selectedValue), resolvedShowSecond)
    : null;

  return (
    <div className={twMerge("flex w-full flex-col gap-1", className)} style={{ width }}>
      {label ? <Label label={label} required={required} size={size} /> : null}
      <span ref={floating.triggerRef} className="block w-full" {...floating.triggerProps}>
        <button
          type="button"
          disabled={disabled}
          className={timePickerRootVariants({
            size,
            variant,
            error: Boolean(errorMessage),
            disabled,
            readOnly,
            interactive: !disabled && !readOnly,
          })}
        >
          <span className={twMerge("min-w-0 flex-1 truncate", !displayedValue && "text-[#999]")}>
            {preview && previewValue === "hover"
              ? use12Hours
                ? formatTwelveHours(formatTime(preview, resolvedShowSecond), resolvedShowSecond)
                : formatTime(preview, resolvedShowSecond)
              : (displayedValue ?? placeholder)}
          </span>
          {allowClear && selectedValue && !disabled && !readOnly ? (
            <span
              className="cursor-pointer"
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
                <Icon icon="close" color="#999" />
              )}
            </span>
          ) : (
            <Icon icon="clock-outlined" color="#999" />
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
                "fixed overflow-hidden rounded-lg bg-white font-pretendard text-sm text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.06),0_3px_6px_-4px_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.03)] motion-reduce:transition-none",
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
              {renderExtraFooter ? (
                <div className="border-t border-[#f0f0f0] p-2">{renderExtraFooter()}</div>
              ) : null}
              {showNow || needConfirm ? (
                <div className="flex min-h-10 items-center justify-between gap-2 border-t border-[#f0f0f0] px-2 py-1">
                  {showNow ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const now = new Date();
                        const next = {
                          hour: now.getHours(),
                          minute: now.getMinutes(),
                          second: now.getSeconds(),
                        };
                        setPending(next);
                        commitTime(next);
                        floating.changeOpen(false, "menu");
                      }}
                    >
                      지금
                    </Button>
                  ) : (
                    <span />
                  )}
                  {needConfirm ? (
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
  const disabledConfig = disabledTime?.(new Date()) ?? {};
  const disabledHours = disabledConfig.disabledHours?.() ?? [];
  const isPm = selected.hour >= 12;

  return (
    <div className={twMerge("flex h-56 divide-x divide-[#f0f0f0]", className)}>
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
            return (
              <button
                key={meridiem}
                type="button"
                className={twMerge(
                  "h-8 w-full shrink-0 cursor-pointer rounded hover:bg-[#f5f5f5]",
                  isSelected && "bg-[#e6f4ff] text-[#0062df] hover:bg-[#e6f4ff]",
                )}
                onClick={() =>
                  onChange({
                    ...selected,
                    hour: toTwentyFourHour(twelveHour(selected.hour), meridiem === "PM"),
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
              "h-8 w-full shrink-0 cursor-pointer rounded hover:bg-[#f5f5f5]",
              selected === value && "bg-[#e6f4ff] font-medium text-[#0062df] hover:bg-[#e6f4ff]",
              valueDisabled && "cursor-not-allowed text-[#ccc] hover:bg-transparent",
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

function formatTwelveHours(value: string, showSecond: boolean) {
  const parts = parseTime(value);
  return `${pad(twelveHour(parts.hour))}:${pad(parts.minute)}${showSecond ? `:${pad(parts.second)}` : ""} ${parts.hour >= 12 ? "PM" : "AM"}`;
}

export const TimePicker = BaseTimePicker;

const timePickerRootVariants = cva(
  "flex w-full items-center gap-2 rounded border border-solid px-2.5 text-left font-pretendard font-medium text-[#111] transition-colors hover:border-[#0062df] focus:border-[#0062df] focus:outline-none",
  {
    variants: {
      size: { lg: "h-10 text-base", md: "h-[30px] text-sm", sm: "h-5 text-xs" },
      variant: {
        default: "border-[#ddd] bg-white",
        filled: "border-[#f5f5f5] bg-[#f5f5f5]",
      },
      error: { true: "border-[#fe5150]", false: "" },
      readOnly: {
        true: "cursor-default hover:border-[#ddd]",
        false: "",
      },
      interactive: {
        true: "cursor-pointer",
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
      interactive: true,
    },
    compoundVariants: [
      {
        variant: "filled",
        readOnly: true,
        className: "hover:border-[#f5f5f5]",
      },
    ],
  },
);
