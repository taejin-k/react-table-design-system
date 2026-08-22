import type { CSSProperties, ReactNode } from "react";

export type BadgeStatus = "success" | "processing" | "default" | "error" | "warning";

export interface BadgeProps {
  children?: ReactNode;
  count?: ReactNode;
  color?: string;
  dot?: boolean;
  offset?: [number, number];
  overflowCount?: number;
  showZero?: boolean;
  size?: "medium" | "small";
  status?: BadgeStatus;
  text?: ReactNode;
  title?: string | null | false;
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<"root" | "indicator" | "status" | "statusText", string>>;
  styles?: Partial<Record<"root" | "indicator" | "status" | "statusText", CSSProperties>>;
}

export interface BadgeRibbonProps {
  children?: ReactNode;
  color?: string;
  placement?: "start" | "end";
  text?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface BadgeComponent {
  (props: BadgeProps): ReactNode;
  Ribbon: (props: BadgeRibbonProps) => ReactNode;
}
