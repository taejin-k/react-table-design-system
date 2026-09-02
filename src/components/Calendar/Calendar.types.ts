import type { Key, ReactElement, ReactNode } from "react";
import type { Dayjs } from "dayjs";

export interface CalendarCellInfo {
  originNode: ReactElement;
  today: Dayjs;
}

export interface CalendarHeaderConfig {
  value: Dayjs;
  onChange: (date: Dayjs) => void;
}

export interface CalendarEvent {
  key: Key;
  title: ReactNode;
  start: Dayjs;
  end?: Dayjs;
  color?: string;
}

export interface CalendarProps {
  value?: Dayjs;
  defaultValue?: Dayjs;
  fullscreen?: boolean;
  validRange?: [Dayjs, Dayjs];
  disabledDate?: (date: Dayjs) => boolean;
  cellRender?: (date: Dayjs, info: CalendarCellInfo) => ReactNode;
  fullCellRender?: (date: Dayjs, info: CalendarCellInfo) => ReactNode;
  headerRender?: (config: CalendarHeaderConfig) => ReactNode;
  events?: CalendarEvent[];
  className?: string;
  onChange?: (date: Dayjs) => void;
  onPanelChange?: (date: Dayjs) => void;
  onSelect?: (date: Dayjs) => void;
  onEventClick?: (event: CalendarEvent) => void;
}
