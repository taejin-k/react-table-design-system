import { createPortal } from "react-dom";
import { useState } from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { ErrorMessage } from "../ErrorMessage";
import { Icon } from "../Icon";
import { Label } from "../Label";
import { ScrollFade } from "../_internal/ScrollFade";
import { getPopupMotionStyle } from "../_internal/motion";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type { TimePickerProps, TimeRangePickerProps } from "./TimePicker.types";

interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseTime(value?: string | null): TimeParts {
  const [hour = 0, minute = 0, second = 0] = (value ?? "").split(":").map(Number);
  return { hour, minute, second };
}

function formatTime(parts: TimeParts, showSecond: boolean) {
  return `${pad(parts.hour)}:${pad(parts.minute)}${showSecond ? `:${pad(parts.second)}` : ""}`;
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
  hideDisabledOptions = false,
  showNow = true,
  prefix,
  suffixIcon,
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
  const [pending, setPending] = useState<TimeParts>(() => parseTime(selectedValue));
  const [preview, setPreview] = useState<TimeParts | null>(null);
  const floating = useFloatingLayer({
    placement,
    trigger: "click",
    disabled: disabled || readOnly,
    open,
    defaultOpen,
    onOpenChange: (nextOpen) => {
      if (nextOpen) setPending(parseTime(selectedValue));
      onOpenChange?.(nextOpen);
    },
  });

  const commitTime = (parts: TimeParts | null) => {
    const nextValue = parts
      ? formatTime(parts, showSecond && format !== "HH:mm" && format !== "hh:mm A")
      : null;
    if (value === undefined) setInnerValue(nextValue);
    onChange?.(nextValue, nextValue ?? "");
  };

  const selectParts = (nextParts: TimeParts) => {
    setPending(nextParts);
    if (!needConfirm) commitTime(nextParts);
  };

  const displayedValue = selectedValue
    ? use12Hours
      ? formatTwelveHours(selectedValue, showSecond)
      : formatTime(parseTime(selectedValue), showSecond && format !== "HH:mm")
    : null;

  return (
    <div className={twMerge("flex w-full flex-col gap-1", className)} style={{ width }}>
      {label ? <Label label={label} required={required} size={size} /> : null}
      <span ref={floating.triggerRef} className="block w-full" {...floating.triggerProps}>
        <button
          type="button"
          disabled={disabled}
          aria-readonly={readOnly || undefined}
          className={timePickerRootVariants({
            size,
            variant,
            error: Boolean(errorMessage),
            disabled,
            readOnly,
          })}
        >
          {prefix ? <span className="flex shrink-0 items-center">{prefix}</span> : null}
          <span className={twMerge("min-w-0 flex-1 truncate", !displayedValue && "text-[#999]")}>
            {preview && previewValue === "hover"
              ? use12Hours
                ? formatTwelveHours(formatTime(preview, showSecond), showSecond)
                : formatTime(preview, showSecond)
              : (displayedValue ?? placeholder)}
          </span>
          {allowClear && selectedValue && !disabled && !readOnly ? (
            <span
              className="cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                commitTime(null);
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
            (suffixIcon ?? <Icon icon="clock-outlined" color="#999" />)
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
                ...getPopupMotionStyle(floating.position?.placement, floating.isMotionVisible),
              }}
              {...floating.popupProps}
            >
              <TimePanel
                value={formatTime(pending, true)}
                use12Hours={use12Hours}
                showSecond={showSecond}
                hourStep={hourStep}
                minuteStep={minuteStep}
                secondStep={secondStep}
                changeOnScroll={changeOnScroll}
                disabledTime={disabledTime}
                hideDisabledOptions={hideDisabledOptions}
                cellRender={cellRender}
                onPreview={setPreview}
                onChange={selectParts}
              />
              {renderExtraFooter ? (
                <div className="border-t border-[#f0f0f0] p-2">{renderExtraFooter()}</div>
              ) : null}
              <div className="flex items-center justify-end gap-2 border-t border-[#f0f0f0] p-2">
                {showNow ? (
                  <Button
                    size="sm"
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
                ) : null}
                {needConfirm ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      commitTime(pending);
                      floating.changeOpen(false, "menu");
                    }}
                  >
                    확인
                  </Button>
                ) : null}
              </div>
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
  hideDisabledOptions?: boolean;
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
  hideDisabledOptions = false,
  cellRender,
  onPreview,
  onChange,
}: TimePanelProps) {
  const selected = parseTime(value);
  const disabledConfig = disabledTime?.(new Date()) ?? {};

  return (
    <div className={twMerge("flex h-56 divide-x divide-[#f0f0f0]", className)}>
      <TimeColumn
        values={numberSteps(use12Hours ? 12 : 24, hourStep, use12Hours ? 1 : 0)}
        selected={use12Hours ? twelveHour(selected.hour) : selected.hour}
        disabledValues={disabledConfig.disabledHours?.() ?? []}
        hideDisabledOptions={hideDisabledOptions}
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
        hideDisabledOptions={hideDisabledOptions}
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
          hideDisabledOptions={hideDisabledOptions}
          changeOnScroll={changeOnScroll}
          cellRender={cellRender}
          subType="second"
          onPreview={(second) => onPreview?.(second === null ? null : { ...selected, second })}
          onSelect={(second) => onChange({ ...selected, second })}
        />
      ) : null}
      {use12Hours ? (
        <ScrollFade className="w-16" viewportClassName="p-1" fadeSize={20}>
          {["AM", "PM"].map((meridiem) => {
            const isSelected = (selected.hour >= 12 ? "PM" : "AM") === meridiem;
            return (
              <button
                key={meridiem}
                type="button"
                className={twMerge(
                  "h-8 w-full cursor-pointer rounded hover:bg-[#f5f5f5]",
                  isSelected && "bg-[#e6f4ff] text-[#0062df]",
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
  hideDisabledOptions = false,
  changeOnScroll = false,
  cellRender,
  subType,
  onPreview,
  onSelect,
}: {
  values: number[];
  selected: number;
  disabledValues?: number[];
  hideDisabledOptions?: boolean;
  changeOnScroll?: boolean;
  cellRender?: TimePickerProps["cellRender"];
  subType: "hour" | "minute" | "second";
  onPreview?: (value: number | null) => void;
  onSelect: (value: number) => void;
}) {
  const visibleValues = hideDisabledOptions
    ? values.filter((value) => !disabledValues.includes(value))
    : values;
  return (
    <ScrollFade
      data-time-column={subType}
      className="w-14"
      viewportClassName="p-1"
      fadeSize={20}
      onScroll={(event) => {
        if (!changeOnScroll) return;
        const index = Math.round(event.currentTarget.scrollTop / 32);
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
              "h-8 w-full cursor-pointer rounded hover:bg-[#f5f5f5]",
              selected === value && "bg-[#e6f4ff] font-medium text-[#0062df]",
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

function TimeRangePicker({
  value,
  defaultValue = [null, null],
  placeholder = ["시작 시간", "종료 시간"],
  label,
  errorMessage,
  required = false,
  size = "md",
  onChange,
  onCalendarChange,
  className,
  width,
  ...props
}: TimeRangePickerProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const selectedValue = value ?? innerValue;
  const changeRange = (index: 0 | 1, nextValue: string | null) => {
    const nextRange: [string | null, string | null] = [...selectedValue];
    nextRange[index] = nextValue;
    if (value === undefined) setInnerValue(nextRange);
    onChange?.(nextRange, [nextRange[0] ?? "", nextRange[1] ?? ""]);
    onCalendarChange?.(nextRange, [nextRange[0] ?? "", nextRange[1] ?? ""], {
      range: index === 0 ? "start" : "end",
    });
  };

  return (
    <div className={twMerge("flex w-full flex-col gap-1", className)} style={{ width }}>
      {label ? <Label label={label} required={required} size={size} /> : null}
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <BaseTimePicker
          {...props}
          size={size}
          value={selectedValue[0]}
          placeholder={placeholder[0]}
          onChange={(nextValue) => changeRange(0, nextValue)}
        />
        <span className="pt-1.5 text-[#999]">-</span>
        <BaseTimePicker
          {...props}
          size={size}
          value={selectedValue[1]}
          placeholder={placeholder[1]}
          onChange={(nextValue) => changeRange(1, nextValue)}
        />
      </div>
      <ErrorMessage errorMessage={errorMessage} />
    </div>
  );
}

type TimePickerComponent = typeof BaseTimePicker & { RangePicker: typeof TimeRangePicker };

export const TimePicker = Object.assign(BaseTimePicker, {
  RangePicker: TimeRangePicker,
}) as TimePickerComponent;

const timePickerRootVariants = cva(
  "flex w-full cursor-pointer items-center gap-2 rounded border border-solid bg-white px-2.5 text-left font-pretendard font-medium text-[#111] transition-colors hover:border-[#0062df] focus-visible:border-[#0062df] focus-visible:outline-none",
  {
    variants: {
      size: { lg: "h-10 text-base", md: "h-[30px] text-sm", sm: "h-5 text-xs" },
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
