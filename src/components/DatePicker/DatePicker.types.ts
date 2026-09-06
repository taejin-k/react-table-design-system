import type { ReactNode } from "react";
import type { Dayjs } from "dayjs";
import type { DisabledTime } from "../TimePicker";
import type { ValidatableErrorMessage } from "../_internal/useErrorMessageValidation";

export type DatePickerSizeType = "md" | "lg";
export type DatePickerModeType = "date" | "month" | "year";
export type DatePickerPlacementType = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type DatePickerVariantType = "default" | "filled";
export type DatePickerErrorMessage<Multiple extends boolean = false> = ValidatableErrorMessage<
  Multiple extends true ? Dayjs[] : Dayjs | undefined
>;
export type DateRangePickerErrorMessage = ValidatableErrorMessage<[Dayjs, Dayjs] | undefined>;

export interface DatePickerPreset {
  label: ReactNode;
  value: Dayjs | (() => Dayjs);
}

export interface DateRangePreset {
  label: ReactNode;
  value: [Dayjs, Dayjs] | (() => [Dayjs, Dayjs]);
}

export interface DatePickerShowTime {
  defaultOpenValue?: Dayjs;
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

export interface DatePickerProps<Multiple extends boolean = false> {
  value?: Multiple extends true ? Dayjs[] : Dayjs | undefined;
  defaultValue?: Multiple extends true ? Dayjs[] : Dayjs | undefined;
  defaultPickerValue?: Dayjs;
  pickerValue?: Dayjs;
  picker?: DatePickerModeType;
  placeholder?: string;
  format?: string | ((value: Dayjs) => string);
  size?: DatePickerSizeType;
  variant?: DatePickerVariantType;
  label?: ReactNode;
  errorMessage?: DatePickerErrorMessage<Multiple>;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  width?: number;
  allowClear?: boolean;
  multiple?: Multiple;
  order?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  showNow?: boolean;
  showTime?: boolean | DatePickerShowTime;
  needConfirm?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: DatePickerPlacementType;
  disabledDate?: (date: Dayjs) => boolean;
  cellRender?: (date: Dayjs, origin: ReactNode) => ReactNode;
  presets?: DatePickerPreset[];
  className?: string;
  onChange?: (value: Multiple extends true ? Dayjs[] : Dayjs | undefined) => void;
  onCalendarChange?: (value: Multiple extends true ? Dayjs[] : Dayjs | undefined) => void;
  onClear?: () => void;
  onPanelChange?: (value: Dayjs, mode: DatePickerModeType) => void;
  onOpenChange?: (open: boolean) => void;
}

export interface DateRangePickerProps extends Omit<
  DatePickerProps,
  | "defaultValue"
  | "errorMessage"
  | "multiple"
  | "needConfirm"
  | "onCalendarChange"
  | "onChange"
  | "order"
  | "placeholder"
  | "presets"
  | "showTime"
  | "value"
> {
  value?: [Dayjs, Dayjs];
  defaultValue?: [Dayjs, Dayjs];
  errorMessage?: DateRangePickerErrorMessage;
  placeholder?: [string, string];
  onChange?: (value: [Dayjs, Dayjs] | undefined) => void;
  presets?: DateRangePreset[];
  onCalendarChange?: (
    value: [Dayjs | undefined, Dayjs | undefined],
    info: { range: "start" | "end" },
  ) => void;
}
