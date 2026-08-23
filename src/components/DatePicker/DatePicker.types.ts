import type { ReactNode } from "react";
import type { InputSizeType } from "../Input";
import type { DisabledTime, TimePickerCellInfo } from "../TimePicker";

export type DatePickerValueType = string;
export type DatePickerSizeType = InputSizeType;
export type DatePickerModeType = "date" | "week" | "month" | "quarter" | "year";
export type DatePickerPlacementType = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type DatePickerVariantType = "default" | "outlined" | "filled";

export interface DatePickerCellInfo {
  originNode: ReactNode;
  today: Date;
  type: DatePickerModeType;
  range?: "start" | "end";
}

export interface DatePickerPreset {
  label: ReactNode;
  value: DatePickerValueType | (() => DatePickerValueType);
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
  value?: DatePickerValueType | DatePickerValueType[] | null;
  defaultValue?: DatePickerValueType | DatePickerValueType[];
  defaultPickerValue?: DatePickerValueType;
  pickerValue?: DatePickerValueType;
  picker?: DatePickerModeType;
  placeholder?: string;
  format?: string | ((value: DatePickerValueType) => string);
  size?: DatePickerSizeType;
  variant?: DatePickerVariantType;
  label?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  width?: number | string;
  allowClear?: boolean | { clearIcon?: ReactNode };
  multiple?: boolean;
  order?: boolean;
  minDate?: DatePickerValueType;
  maxDate?: DatePickerValueType;
  showWeek?: boolean;
  showNow?: boolean;
  showTime?: boolean | DatePickerShowTime;
  needConfirm?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: DatePickerPlacementType;
  disabledDate?: (date: Date) => boolean;
  cellRender?: (date: Date, info: DatePickerCellInfo) => ReactNode;
  renderExtraFooter?: (mode: DatePickerModeType) => ReactNode;
  presets?: DatePickerPreset[];
  className?: string;
  onChange?: (
    value: DatePickerValueType | DatePickerValueType[] | null,
    dateString: string | string[],
  ) => void;
  onCalendarChange?: (value: DatePickerValueType | DatePickerValueType[] | null) => void;
  onClear?: () => void;
  onOk?: (value: DatePickerValueType | DatePickerValueType[] | null) => void;
  onPanelChange?: (value: DatePickerValueType, mode: DatePickerModeType) => void;
  onOpenChange?: (open: boolean) => void;
}

export interface DateRangePickerProps extends Omit<
  DatePickerProps,
  | "defaultValue"
  | "multiple"
  | "needConfirm"
  | "onCalendarChange"
  | "onChange"
  | "onOk"
  | "order"
  | "placeholder"
  | "presets"
  | "showTime"
  | "value"
> {
  value?: [DatePickerValueType | null, DatePickerValueType | null];
  defaultValue?: [DatePickerValueType | null, DatePickerValueType | null];
  placeholder?: [string, string];
  onChange?: (
    value: [DatePickerValueType | null, DatePickerValueType | null],
    dateStrings: [string, string],
  ) => void;
  presets?: Array<{
    label: ReactNode;
    value:
      | [DatePickerValueType | null, DatePickerValueType | null]
      | (() => [DatePickerValueType | null, DatePickerValueType | null]);
  }>;
  onCalendarChange?: (
    value: [DatePickerValueType | null, DatePickerValueType | null],
    info: { range: "start" | "end" },
  ) => void;
}
