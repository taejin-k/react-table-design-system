import type { CSSProperties, SVGProps } from "react";
import type { ColorTokenType } from "../../color-tokens";
import type { IconGalleryName } from "./Icon.names";

export type IconNameType =
  | "add"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "arrow-up"
  | "bell"
  | "calendar"
  | "check"
  | "check-circle"
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "chevron-up"
  | "close"
  | "close-circle"
  | "clock"
  | "copy"
  | "delete"
  | "download"
  | "drag-handle"
  | "edit"
  | "edit-square"
  | "external-link"
  | "eye"
  | "eye-off"
  | "file"
  | "filter"
  | "folder"
  | "help-circle"
  | "home"
  | "loading"
  | "info"
  | "link"
  | "lock"
  | "mail"
  | "menu"
  | "more-horizontal"
  | "more-vertical"
  | "remove"
  | "refresh"
  | "search"
  | "setting"
  | "sorter"
  | "star"
  | "upload"
  | "user"
  | "users"
  | "warning"
  | IconGalleryName;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "color" | "name"> {
  icon: IconNameType;
  size?: number;
  color?: ColorTokenType | CSSProperties["color"];
  /** true면 클릭과 hover 동작을 비활성화한다. */
  disabled?: boolean;
  /** true면 기존 아이콘 대신 로딩 아이콘을 표시하고 동작을 막는다. */
  loading?: boolean;
}
