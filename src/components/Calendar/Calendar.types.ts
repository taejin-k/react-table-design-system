import type { CSSProperties, ReactElement, ReactNode } from "react";

export type CalendarModeType = "month" | "year";
export type CalendarSelectSourceType = "year" | "month" | "date" | "customize";

export interface CalendarCellInfo {
  originNode: ReactElement;
  today: Date;
  type: CalendarModeType;
}

export interface CalendarProps {
  value?: Date;
  defaultValue?: Date;
  mode?: CalendarModeType;
  fullscreen?: boolean;
  validRange?: [Date, Date];
  disabledDate?: (date: Date) => boolean;
  cellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;
  fullCellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;
  headerRender?: (config: {
    value: Date;
    type: CalendarModeType;
    onChange: (date: Date) => void;
    onTypeChange: (mode: CalendarModeType) => void;
  }) => ReactNode;
  className?: string;
  style?: CSSProperties;
  onChange?: (date: Date) => void;
  onPanelChange?: (date: Date, mode: CalendarModeType) => void;
  onSelect?: (date: Date, info: { source: CalendarSelectSourceType }) => void;
}
