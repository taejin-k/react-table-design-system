import type {
  AnchorHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";
import type { ColorTokenType } from "../../color-tokens";

export interface BreadcrumbItem extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "color" | "href" | "onClick" | "title"
> {
  /** 화면에 표시할 경로 이름. 아이콘만 표시할 때는 생략한다. */
  title?: ReactNode;
  /** 있으면 링크로 렌더링하고 hover·focus 디자인을 적용한다. */
  href?: string;
  /** 클릭할 때 실행하며, href가 없어도 hover·focus 디자인을 적용한다. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** 경로 이름 앞에 표시할 아이콘. */
  icon?: ReactNode;
  /** 해당 item의 글자와 아이콘에 적용할 색상 토큰 이름 또는 CSS 색상. */
  color?: ColorTokenType | CSSProperties["color"];
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** 왼쪽부터 현재 위치까지 순서대로 전달한다. */
  items?: BreadcrumbItem[];
}
