import type { ReactElement, ReactNode } from "react";

export type CalendarSelectSourceType = "date";

export interface CalendarCellInfo {
  originNode: ReactElement;
  today: Date;
}

export interface CalendarProps {
  value?: Date;
  defaultValue?: Date;
  fullscreen?: boolean;
  validRange?: [Date, Date];
  disabledDate?: (date: Date) => boolean;
  cellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;
  fullCellRender?: (date: Date, info: CalendarCellInfo) => ReactNode;
  headerRender?: (config: { value: Date; onChange: (date: Date) => void }) => ReactNode;
  className?: string;
  onChange?: (date: Date) => void;
  onPanelChange?: (date: Date) => void;
  onSelect?: (date: Date, info: { source: CalendarSelectSourceType }) => void;
}
