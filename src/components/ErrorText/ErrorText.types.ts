import type { HTMLAttributes, ReactNode } from "react";

export interface ErrorTextProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children?: ReactNode;
}
