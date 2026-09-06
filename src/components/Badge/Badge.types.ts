import type { CSSProperties, ReactNode } from "react";
import type { ColorTokenType } from "../../color-tokens";

export interface BadgeProps {
  color: ColorTokenType;
  process?: boolean;
  label?: ReactNode;
  /** 오른쪽 위에 배지를 붙일 요소예요. */
  children?: ReactNode;
  /** 배지 안에 표시해요. 생략하거나 빈 문자열이면 점으로 표시해요. */
  content?: string | number;
  /** [x, y] 이동 거리(px). 양수는 오른쪽·아래쪽이에요. */
  offset?: readonly [number, number];
  className?: string;
  style?: CSSProperties;
}
