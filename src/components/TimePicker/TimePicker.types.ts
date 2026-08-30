import type { ReactNode } from "react";
import type { InputSizeType } from "../Input";

export type TimePickerValueType = string | null;
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
  range?: "start" | "end";
  subType: "hour" | "minute" | "second" | "meridiem";
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
  hideDisabled?: boolean;
  showNow?: boolean;
  previewValue?: false | "hover";
  renderExtraFooter?: () => ReactNode;
  cellRender?: (current: number | string, info: TimePickerCellInfo) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  placement?: TimePickerPlacementType;
  className?: string;
  onChange?: (value: TimePickerValueType, timeString: string) => void;
  onClear?: () => void;
  onOpenChange?: (open: boolean) => void;
}
