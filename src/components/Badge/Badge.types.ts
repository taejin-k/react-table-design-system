import type { CSSProperties, ReactNode } from "react";

export type BadgeStatusType = "success" | "processing" | "default" | "error" | "warning";

export interface BadgeProps {
  status: BadgeStatusType;
  process?: boolean;
  text?: ReactNode;
  color?: string;
  className?: string;
  style?: CSSProperties;
}
