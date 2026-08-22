import type { ReactNode } from "react";
import type { InputSizeType } from "../Input";
import type { DisabledTime, TimePickerCellInfo } from "../TimePicker";

export type DatePickerValue = string;
export type DatePickerMode = "date" | "week" | "month" | "quarter" | "year";
export type DatePickerPlacement = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type DatePickerVariant = "default" | "outlined" | "filled" | "borderless" | "underlined";

export interface DatePickerCellInfo {
  originNode: ReactNode;
  today: Date;
  type: DatePickerMode;
  range?: "start" | "end";
}

export interface DatePickerPreset {
  label: ReactNode;
  value: DatePickerValue | (() => DatePickerValue);
}

export interface DatePickerShowTime {
  defaultOpenValue?: string;
  format?: string;
  use12Hours?: boolean;
  showSecond?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  disabledTime?: (now: Date) => DisabledTime;
  hideDisabledOptions?: boolean;
  changeOnScroll?: boolean;
  cellRender?: (current: number | string, info: TimePickerCellInfo) => ReactNode;
}

export interface DatePickerProps {
  value?: DatePickerValue | DatePickerValue[] | null;
  defaultValue?: DatePickerValue | DatePickerValue[];
  defaultPickerValue?: DatePickerValue;
  pickerValue?: DatePickerValue;
  picker?: DatePickerMode;
  placeholder?: string;
  format?: string | ((value: DatePickerValue) => string);
  size?: InputSizeType;
  variant?: DatePickerVariant;
  label?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  width?: number | string;
  allowClear?: boolean | { clearIcon?: ReactNode };
  multiple?: boolean;
  order?: boolean;
  minDate?: DatePickerValue;
  maxDate?: DatePickerValue;
  showWeek?: boolean;
  showNow?: boolean;
  showTime?: boolean | DatePickerShowTime;
  needConfirm?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: DatePickerPlacement;
  disabledDate?: (date: Date) => boolean;
  cellRender?: (date: Date, info: DatePickerCellInfo) => ReactNode;
  renderExtraFooter?: (mode: DatePickerMode) => ReactNode;
  presets?: DatePickerPreset[];
  className?: string;
  onChange?: (
    value: DatePickerValue | DatePickerValue[] | null,
    dateString: string | string[],
  ) => void;
  onCalendarChange?: (value: DatePickerValue | DatePickerValue[] | null) => void;
  onClear?: () => void;
  onOk?: (value: DatePickerValue | DatePickerValue[] | null) => void;
  onPanelChange?: (value: DatePickerValue, mode: DatePickerMode) => void;
  onOpenChange?: (open: boolean) => void;
}

export interface DateRangePickerProps extends Omit<
  DatePickerProps,
  | "defaultValue"
  | "multiple"
  | "onCalendarChange"
  | "onChange"
  | "placeholder"
  | "presets"
  | "value"
> {
  value?: [DatePickerValue | null, DatePickerValue | null];
  defaultValue?: [DatePickerValue | null, DatePickerValue | null];
  placeholder?: [string, string];
  onChange?: (
    value: [DatePickerValue | null, DatePickerValue | null],
    dateStrings: [string, string],
  ) => void;
  presets?: Array<{
    label: ReactNode;
    value:
      | [DatePickerValue | null, DatePickerValue | null]
      | (() => [DatePickerValue | null, DatePickerValue | null]);
  }>;
  onCalendarChange?: (
    value: [DatePickerValue | null, DatePickerValue | null],
    info: { range: "start" | "end" },
  ) => void;
}
