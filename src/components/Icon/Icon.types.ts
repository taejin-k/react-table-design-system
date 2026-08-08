import type { SVGProps } from "react";

export type IconName = "add" | "close" | "delete" | "edit" | "edit-square" | "home" | "setting";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "color" | "name"> {
  icon: IconName;
  size?: number;
  color?: string;
}
