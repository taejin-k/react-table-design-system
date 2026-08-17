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
  const boundary = getViewportBoundary(viewportGap);
  const placements = autoAdjustOverflow
    ? getPlacementCandidates(target, requestedPlacement, boundary)
    : [requestedPlacement];
  const best = placements
    .map((placement, priority) => {
      const point = getPlacementPoint(target, popup, placement, targetGap);
      return {
        placement,
        point,
        priority,
        overflow: getOverflow(point, popup, boundary),
      };
    })
    .reduce((current, candidate) => {
      if (candidate.overflow < current.overflow) return candidate;
      if (candidate.overflow === current.overflow && candidate.priority < current.priority)
        return candidate;
      return current;
    });

  const placement = best.placement;
  const point = best.point;
  const maxLeft = Math.max(boundary.left, boundary.right - popup.width);
  const maxTop = Math.max(boundary.top, boundary.bottom - popup.height);
  const left = autoAdjustOverflow ? clamp(point.left, boundary.left, maxLeft) : point.left;
  const top = autoAdjustOverflow ? clamp(point.top, boundary.top, maxTop) : point.top;

  return {
    left,
    top,
    placement,
    arrowStyle: getArrowStyle(target, popup, placement, left, top, arrowSize, edgeArrowCenter),
  };
}

interface FloatingBoundary {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function getViewportBoundary(viewportGap: number): FloatingBoundary {
  const viewport = window.visualViewport;
  const left = (viewport?.offsetLeft ?? 0) + viewportGap;
  const top = (viewport?.offsetTop ?? 0) + viewportGap;
  const width = viewport?.width ?? window.innerWidth;
  const height = viewport?.height ?? window.innerHeight;

  return {
    left,
    top,
    right: left + width - viewportGap * 2,
    bottom: top + height - viewportGap * 2,
  };
}

function getPlacementCandidates(
  target: DOMRect,
  requestedPlacement: FloatingPlacement,
  boundary: FloatingBoundary,
): FloatingPlacement[] {
  const flippedPlacement = flipPlacement(requestedPlacement);
  const alignedPlacement = flipAlignment(requestedPlacement);
  const flippedAlignedPlacement = flipAlignment(flippedPlacement);
  const vertical = requestedPlacement.startsWith("top") || requestedPlacement.startsWith("bottom");
  const perpendicularPlacements: FloatingPlacement[] = vertical
    ? boundary.right - target.right >= target.left - boundary.left
      ? ["right", "left"]
      : ["left", "right"]
    : boundary.bottom - target.bottom >= target.top - boundary.top
      ? ["bottom", "top"]
      : ["top", "bottom"];

  return [
    ...new Set([
      requestedPlacement,
      flippedPlacement,
      alignedPlacement,
      flippedAlignedPlacement,
      ...perpendicularPlacements,
    ]),
  ];
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

function flipPlacement(placement: FloatingPlacement): FloatingPlacement {
  if (placement.startsWith("top")) return placement.replace("top", "bottom") as FloatingPlacement;
  if (placement.startsWith("bottom"))
    return placement.replace("bottom", "top") as FloatingPlacement;
  if (placement.startsWith("left")) return placement.replace("left", "right") as FloatingPlacement;
  return placement.replace("right", "left") as FloatingPlacement;
}

function flipAlignment(placement: FloatingPlacement): FloatingPlacement {
  if (placement.endsWith("Left")) return placement.replace("Left", "Right") as FloatingPlacement;
  if (placement.endsWith("Right")) return placement.replace("Right", "Left") as FloatingPlacement;
  if (placement.endsWith("Top")) return placement.replace("Top", "Bottom") as FloatingPlacement;
  if (placement.endsWith("Bottom")) return placement.replace("Bottom", "Top") as FloatingPlacement;
  return placement;
}

function getOverflow(
  point: { left: number; top: number },
  popup: DOMRect,
  boundary: FloatingBoundary,
) {
  return (
    Math.max(0, boundary.left - point.left) +
    Math.max(0, point.left + popup.width - boundary.right) +
    Math.max(0, boundary.top - point.top) +
    Math.max(0, point.top + popup.height - boundary.bottom)
  );
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
