import type { HTMLAttributes, ReactNode } from "react";

export type IllustrationType =
  | "list"
  | "noResults"
  | "error"
  | "network"
  | "permission"
  | "file"
  | "notification"
  | "message"
  | "calendar"
  | "chart"
  | "comingSoon"
  | "completed";

export type IllustrationSize = "sm" | "md" | "lg";

export interface IllustrationsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 표시할 이미지 종류. */
  type?: IllustrationType;
  /** 이미지 크기. */
  size?: IllustrationSize;
  /** 이미지 아래에 표시할 안내 내용. */
  description?: ReactNode;
}
