import type { AriaAttributes, CSSProperties, MouseEvent as ReactMouseEvent, HTMLAttributes, ReactNode } from "react";

export type BreadcrumbKey = string | number;
export type BreadcrumbParams = Record<string, string | number | boolean | null | undefined>;

export type BreadcrumbMenuClickInfo = {
  key: BreadcrumbKey;
  domEvent: ReactMouseEvent<HTMLElement>;
};

export type BreadcrumbMenuItem = {
  key?: BreadcrumbKey;
  label?: ReactNode;
  title?: ReactNode;
  path?: string;
  href?: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  type?: "divider";
  className?: string;
  style?: CSSProperties;
  onClick?: (info: BreadcrumbMenuClickInfo) => void;
};

export type BreadcrumbMenuProps = {
  items?: BreadcrumbMenuItem[];
  className?: string;
  style?: CSSProperties;
  onClick?: (info: BreadcrumbMenuClickInfo) => void;
};

export type BreadcrumbDropdownPlacement = "bottom" | "bottomLeft" | "bottomRight" | "top" | "topLeft" | "topRight";

export type BreadcrumbDropdownProps = {
  open?: boolean;
  defaultOpen?: boolean;
  trigger?: Array<"hover" | "click">;
  placement?: BreadcrumbDropdownPlacement;
  disabled?: boolean;
  className?: string;
  overlayClassName?: string;
  style?: CSSProperties;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  onOpenChange?: (open: boolean, info: { source: "trigger" | "menu" }) => void;
};

export type BreadcrumbRouteItem = AriaAttributes & {
  type?: never;
  key?: BreadcrumbKey;
  href?: string;
  path?: string;
  title?: ReactNode;
  /** @deprecated title를 쓴다. */
  breadcrumbName?: string;
  menu?: BreadcrumbMenuProps;
  className?: string;
  style?: CSSProperties;
  dropdownProps?: BreadcrumbDropdownProps;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement | HTMLSpanElement | HTMLButtonElement>) => void;
  /** @deprecated menu를 쓴다. */
  children?: Omit<BreadcrumbRouteItem, "children">[];
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export type BreadcrumbSeparatorItem = {
  key?: BreadcrumbKey;
  type: "separator";
  separator?: ReactNode;
};

export type BreadcrumbItemType = BreadcrumbRouteItem | BreadcrumbSeparatorItem;

export type BreadcrumbSemanticClassNames = {
  root?: string;
  item?: string;
  separator?: string;
};

export type BreadcrumbSemanticStyles = {
  root?: CSSProperties;
  item?: CSSProperties;
  separator?: CSSProperties;
};

export type BreadcrumbProps<T extends BreadcrumbParams = BreadcrumbParams> = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  items?: BreadcrumbItemType[];
  /** @deprecated items를 쓴다. */
  routes?: BreadcrumbItemType[];
  itemRender?: (route: BreadcrumbItemType, params: T, routes: BreadcrumbItemType[], paths: string[]) => ReactNode;
  params?: T;
  separator?: ReactNode;
  dropdownIcon?: ReactNode;
  rootClassName?: string;
  classNames?: BreadcrumbSemanticClassNames | ((info: { props: BreadcrumbProps<T> }) => BreadcrumbSemanticClassNames);
  styles?: BreadcrumbSemanticStyles | ((info: { props: BreadcrumbProps<T> }) => BreadcrumbSemanticStyles);
  children?: ReactNode;
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export type BreadcrumbItemProps = Omit<BreadcrumbRouteItem, "title" | "children"> & {
  separator?: ReactNode;
  children?: ReactNode;
};

export type BreadcrumbSeparatorProps = {
  separator?: ReactNode;
  children?: ReactNode;
};
