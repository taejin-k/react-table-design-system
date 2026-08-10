import type { CSSProperties } from "react";

export type FloatingPlacement =
  | "top"
  | "topLeft"
  | "topRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight"
  | "left"
  | "leftTop"
  | "leftBottom"
  | "right"
  | "rightTop"
  | "rightBottom";

export interface FloatingPosition {
  left: number;
  top: number;
  placement: FloatingPlacement;
  arrowStyle: CSSProperties;
}

interface FloatingPositionOptions {
  autoAdjustOverflow?: boolean;
  arrowSize?: number;
  edgeArrowCenter?: number;
  targetGap?: number;
  viewportGap?: number;
}

export function calculateFloatingPosition(
  target: DOMRect,
  popup: DOMRect,
  requestedPlacement: FloatingPlacement,
  {
    autoAdjustOverflow = true,
    arrowSize = 8,
    edgeArrowCenter = 16,
    targetGap = 9,
    viewportGap = 8,
  }: FloatingPositionOptions = {},
): FloatingPosition {
  let placement = requestedPlacement;
  let point = getPlacementPoint(target, popup, placement, targetGap);

  if (autoAdjustOverflow && overflowsMainAxis(point, popup, placement, viewportGap)) {
    placement = flipPlacement(placement);
    point = getPlacementPoint(target, popup, placement, targetGap);
  }

  const maxLeft = Math.max(viewportGap, window.innerWidth - popup.width - viewportGap);
  const maxTop = Math.max(viewportGap, window.innerHeight - popup.height - viewportGap);
  const left = autoAdjustOverflow ? clamp(point.left, viewportGap, maxLeft) : point.left;
  const top = autoAdjustOverflow ? clamp(point.top, viewportGap, maxTop) : point.top;

  return {
    left,
    top,
    placement,
    arrowStyle: getArrowStyle(target, popup, placement, left, top, arrowSize, edgeArrowCenter),
  };
}

function getPlacementPoint(
  target: DOMRect,
  popup: DOMRect,
  placement: FloatingPlacement,
  targetGap: number,
) {
  const vertical = placement.startsWith("top") || placement.startsWith("bottom");
  const side = placement.startsWith("top")
    ? "top"
    : placement.startsWith("bottom")
      ? "bottom"
      : placement.startsWith("left")
        ? "left"
        : "right";

  if (vertical) {
    const left = placement.endsWith("Left")
      ? target.left
      : placement.endsWith("Right")
        ? target.right - popup.width
        : target.left + (target.width - popup.width) / 2;
    const top = side === "top" ? target.top - popup.height - targetGap : target.bottom + targetGap;
    return { left, top };
  }

  const top = placement.endsWith("Top")
    ? target.top
    : placement.endsWith("Bottom")
      ? target.bottom - popup.height
      : target.top + (target.height - popup.height) / 2;
  const left = side === "left" ? target.left - popup.width - targetGap : target.right + targetGap;
  return { left, top };
}

function overflowsMainAxis(
  point: { left: number; top: number },
  popup: DOMRect,
  placement: FloatingPlacement,
  viewportGap: number,
) {
  if (placement.startsWith("top")) return point.top < viewportGap;
  if (placement.startsWith("bottom"))
    return point.top + popup.height > window.innerHeight - viewportGap;
  if (placement.startsWith("left")) return point.left < viewportGap;
  return point.left + popup.width > window.innerWidth - viewportGap;
}

function flipPlacement(placement: FloatingPlacement): FloatingPlacement {
  if (placement.startsWith("top")) return placement.replace("top", "bottom") as FloatingPlacement;
  if (placement.startsWith("bottom"))
    return placement.replace("bottom", "top") as FloatingPlacement;
  if (placement.startsWith("left")) return placement.replace("left", "right") as FloatingPlacement;
  return placement.replace("right", "left") as FloatingPlacement;
}

function getArrowStyle(
  target: DOMRect,
  popup: DOMRect,
  placement: FloatingPlacement,
  left: number,
  top: number,
  arrowSize: number,
  edgeArrowCenter: number,
): CSSProperties {
  const halfArrow = arrowSize / 2;
  const targetCenterX = target.left + target.width / 2 - left - halfArrow;
  const targetCenterY = target.top + target.height / 2 - top - halfArrow;
  const horizontalArrowPosition = placement.endsWith("Left")
    ? edgeArrowCenter - halfArrow
    : placement.endsWith("Right")
      ? popup.width - edgeArrowCenter - halfArrow
      : targetCenterX;
  const verticalArrowPosition = placement.endsWith("Top")
    ? edgeArrowCenter - halfArrow
    : placement.endsWith("Bottom")
      ? popup.height - edgeArrowCenter - halfArrow
      : targetCenterY;

  if (placement.startsWith("top")) {
    return {
      bottom: -halfArrow,
      left: clamp(horizontalArrowPosition, arrowSize, popup.width - arrowSize * 2),
    };
  }
  if (placement.startsWith("bottom")) {
    return {
      top: -halfArrow,
      left: clamp(horizontalArrowPosition, arrowSize, popup.width - arrowSize * 2),
    };
  }
  if (placement.startsWith("left")) {
    return {
      right: -halfArrow,
      top: clamp(verticalArrowPosition, arrowSize, popup.height - arrowSize * 2),
    };
  }
  return {
    left: -halfArrow,
    top: clamp(verticalArrowPosition, arrowSize, popup.height - arrowSize * 2),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
