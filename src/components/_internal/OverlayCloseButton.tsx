import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Icon } from "../Icon";

interface OverlayCloseButtonProps {
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function OverlayCloseButton({
  icon,
  disabled,
  className,
  style,
  onClick,
}: OverlayCloseButtonProps) {
  return (
    <Button
      data-overlay-close-button
      variant="ghost"
      size="md"
      iconOnly
      prefixIcon={<span className="inline-flex">{icon ?? <Icon icon="close" size={16} />}</span>}
      disabled={disabled}
      className={twMerge("size-7 shrink-0 text-dark-gray", className)}
      style={style}
      onClick={onClick}
    />
  );
}
