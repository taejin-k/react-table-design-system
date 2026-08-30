import type { ReactNode } from "react";
import type { DisabledTime } from "../TimePicker";

export type DatePickerValueType = string | string[] | null;
export type DateRangeValueType = [string | null, string | null];
export type DatePickerSizeType = "md" | "lg";
export type DatePickerModeType = "date" | "month" | "year";
export type DatePickerPlacementType = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type DatePickerVariantType = "default" | "filled";

export interface DatePickerPreset {
  label: ReactNode;
  value: string | (() => string);
}

export interface DateRangePreset {
  label: ReactNode;
  value: DateRangeValueType | (() => DateRangeValueType);
}

export interface DatePickerShowTime {
  defaultOpenValue?: string;
  format?: string;
  use12Hours?: boolean;
  showSecond?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  disabledTime?: () => DisabledTime;
  hideDisabled?: boolean;
  changeOnScroll?: boolean;
}

export interface DatePickerProps {
  value?: DatePickerValueType;
  defaultValue?: DatePickerValueType;
  defaultPickerValue?: string;
  pickerValue?: string;
  picker?: DatePickerModeType;
  placeholder?: string;
  format?: string | ((value: string) => string);
  size?: DatePickerSizeType;
  variant?: DatePickerVariantType;
  label?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  width?: number;
  allowClear?: boolean;
  multiple?: boolean;
  order?: boolean;
  minDate?: string;
  maxDate?: string;
  showNow?: boolean;
  showTime?: boolean | DatePickerShowTime;
  needConfirm?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: DatePickerPlacementType;
  disabledDate?: (date: Date) => boolean;
  cellRender?: (date: Date, origin: ReactNode) => ReactNode;
  presets?: DatePickerPreset[];
  className?: string;
  onChange?: (value: DatePickerValueType) => void;
  onCalendarChange?: (value: DatePickerValueType) => void;
  onClear?: () => void;
  onConfirm?: (value: DatePickerValueType) => void;
  onPanelChange?: (value: string, mode: DatePickerModeType) => void;
  onOpenChange?: (open: boolean) => void;
}

export interface DateRangePickerProps extends Omit<
  DatePickerProps,
  | "defaultValue"
  | "multiple"
  | "needConfirm"
  | "onCalendarChange"
  | "onChange"
  | "onConfirm"
  | "order"
  | "placeholder"
  | "presets"
  | "showTime"
  | "value"
> {
  value?: DateRangeValueType;
  defaultValue?: DateRangeValueType;
  placeholder?: [string, string];
  onChange?: (value: DateRangeValueType) => void;
  presets?: DateRangePreset[];
  onCalendarChange?: (value: DateRangeValueType, info: { range: "start" | "end" }) => void;
}
