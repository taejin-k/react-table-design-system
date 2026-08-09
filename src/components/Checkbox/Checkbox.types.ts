import type { InputHTMLAttributes, ReactNode } from "react";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "className"
> {
  /** 있으면 체크박스 오른쪽에 레이블을 표시한다. */
  label?: ReactNode;
  /** true면 테두리와 체크 색상을 오류 색상으로 표시한다. */
  error?: boolean;
  /** true면 일부 항목만 선택된 중간 상태를 표시한다. */
  indeterminate?: boolean;
  /** 최상위 label 요소에 추가할 클래스다. */
  className?: string;
}
