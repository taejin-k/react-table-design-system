import type { ReactNode } from "react";
import type { Dayjs } from "dayjs";
import type { InputSizeType } from "../Input";
import type { ValidatableErrorMessage } from "../_internal/useErrorMessageValidation";

export type TimePickerSizeType = InputSizeType;
export type TimePickerPlacementType = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type TimePickerVariantType = "default" | "filled";
export type TimePickerErrorMessage<Multiple extends boolean = false> = ValidatableErrorMessage<
  Multiple extends true ? Dayjs[] : Dayjs | undefined
>;

export interface DisabledTime {
  disabledHours?: () => number[];
  disabledMinutes?: (selectedHour: number) => number[];
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];
}

export interface TimePickerCellInfo {
  originNode: ReactNode;
  subType: "hour" | "minute" | "second";
}

export interface TimePickerProps<Multiple extends boolean = false> {
  value?: Multiple extends true ? Dayjs[] : Dayjs | undefined;
  defaultValue?: Multiple extends true ? Dayjs[] : Dayjs | undefined;
  placeholder?: string;
  format?: string;
  size?: TimePickerSizeType;
  variant?: TimePickerVariantType;
  label?: ReactNode;
  errorMessage?: TimePickerErrorMessage<Multiple>;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  width?: number;
  allowClear?: boolean | { clearIcon?: ReactNode };
  multiple?: Multiple;
  order?: boolean;
  use12Hours?: boolean;
  showSecond?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  needConfirm?: boolean;
  changeOnScroll?: boolean;
  disabledTime?: (now: Dayjs) => DisabledTime;
  hideDisabled?: boolean;
  showNow?: boolean;
  previewValue?: false | "hover";
  cellRender?: (current: number, info: TimePickerCellInfo) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: TimePickerPlacementType;
  className?: string;
  onChange?: (
    value: Multiple extends true ? Dayjs[] : Dayjs | undefined,
    timeString: Multiple extends true ? string[] : string,
  ) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
}
