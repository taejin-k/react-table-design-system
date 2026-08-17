import type { ReactNode } from "react";
import type { InputSize } from "../Input";

export type TimePickerValue = string;
export type TimePickerPlacement = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type TimePickerVariant = "default" | "outlined" | "filled" | "borderless" | "underlined";

export interface DisabledTime {
  disabledHours?: () => number[];
  disabledMinutes?: (selectedHour: number) => number[];
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];
}

export interface TimePickerCellInfo {
  originNode: ReactNode;
  range?: "start" | "end";
  subType: "hour" | "minute" | "second" | "meridiem";
}

export interface TimePickerProps {
  value?: TimePickerValue | null;
  defaultValue?: TimePickerValue;
  placeholder?: string;
  format?: string;
  size?: InputSize;
  variant?: TimePickerVariant;
  label?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  width?: number | string;
  allowClear?: boolean | { clearIcon?: ReactNode };
  use12Hours?: boolean;
  showSecond?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  needConfirm?: boolean;
  changeOnScroll?: boolean;
  disabledTime?: (now: Date) => DisabledTime;
  hideDisabledOptions?: boolean;
  showNow?: boolean;
  prefix?: ReactNode;
  suffixIcon?: ReactNode;
  previewValue?: false | "hover";
  renderExtraFooter?: () => ReactNode;
  cellRender?: (current: number | string, info: TimePickerCellInfo) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: TimePickerPlacement;
  className?: string;
  onChange?: (value: TimePickerValue | null, timeString: string) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export interface TimeRangePickerProps extends Omit<
  TimePickerProps,
  "defaultValue" | "onChange" | "placeholder" | "value"
> {
  value?: [TimePickerValue | null, TimePickerValue | null];
  defaultValue?: [TimePickerValue | null, TimePickerValue | null];
  placeholder?: [string, string];
  onChange?: (
    value: [TimePickerValue | null, TimePickerValue | null],
    timeStrings: [string, string],
  ) => void;
  onCalendarChange?: (
    value: [TimePickerValue | null, TimePickerValue | null],
    timeStrings: [string, string],
    info: { range: "start" | "end" },
  ) => void;
}
