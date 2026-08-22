import type { CSSProperties, ReactElement, ReactNode } from "react";

export type CalendarMode = "month" | "year";
export type CalendarSelectSource = "year" | "month" | "date" | "customize";

export interface CalendarCellInfo {
  originNode: ReactElement;
  today: Date;
  type: CalendarMode;
}

export interface CalendarProps {
  value?: Date;
  defaultValue?: Date;
  mode?: CalendarMode;
  fullscreen?: boolean;
  showWeek?: boolean;
  validRange?: [Date, Date];
  disabledDate?: (date: Date) => boolean;
  cellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;
  fullCellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;
  headerRender?: (config: {
    value: Date;
    type: CalendarMode;
    onChange: (date: Date) => void;
    onTypeChange: (mode: CalendarMode) => void;
  }) => ReactNode;
  className?: string;
  style?: CSSProperties;
  onChange?: (date: Date) => void;
  onPanelChange?: (date: Date, mode: CalendarMode) => void;
  onSelect?: (date: Date, info: { source: CalendarSelectSource }) => void;
}
