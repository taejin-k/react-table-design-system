import type { ComponentType, CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";

export type FlexGap = number;

export interface FlexProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children?: ReactNode;
  vertical?: boolean;
  wrap?: CSSProperties["flexWrap"] | boolean;
  justify?: CSSProperties["justifyContent"];
  align?: CSSProperties["alignItems"];
  flex?: CSSProperties["flex"];
  gap?: FlexGap;
  component?: ElementType | ComponentType<Record<string, unknown>>;
}
