import type { ReactNode } from "react";
import type { Dayjs } from "dayjs";
import type { InputSizeType } from "../Input";

export type TimePickerValueType = Dayjs | Dayjs[] | null;
export type TimePickerSizeType = InputSizeType;
export type TimePickerPlacementType = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";
export type TimePickerVariantType = "default" | "filled";

export interface DisabledTime {
  disabledHours?: () => number[];
  disabledMinutes?: (selectedHour: number) => number[];
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[];
}

export interface TimePickerCellInfo {
  originNode: ReactNode;
  subType: "hour" | "minute" | "second";
}

export interface TimePickerProps {
  value?: TimePickerValueType;
  defaultValue?: TimePickerValueType;
  placeholder?: string;
  format?: string;
  size?: TimePickerSizeType;
  variant?: TimePickerVariantType;
  label?: ReactNode;
  errorMessage?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  width?: number;
  allowClear?: boolean | { clearIcon?: ReactNode };
  multiple?: boolean;
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
  onChange?: (value: TimePickerValueType, timeString: string | string[]) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
}
