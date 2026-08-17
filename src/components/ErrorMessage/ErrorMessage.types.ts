import type { HTMLAttributes, ReactNode } from "react";

export interface ErrorMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  errorMessage?: ReactNode;
}
