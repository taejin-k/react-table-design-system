import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type BreadcrumbKey = string | number;

export interface Item extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'color' | 'href' | 'title'> {
  key?: BreadcrumbKey;
  /** 화면에 표시할 경로 이름. */
  title: ReactNode;
  /** 있으면 링크로 렌더링하고 hover·focus 디자인을 적용한다. */
  href?: string;
  /** 경로 이름 앞에 표시할 아이콘. */
  icon?: ReactNode;
  /** 해당 item의 글자와 아이콘 색상. */
  color?: CSSProperties['color'];
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** 왼쪽부터 현재 위치까지 순서대로 전달한다. */
  items?: Item[];
}
