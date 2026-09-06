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

export function getFloatingTransformOrigin(
  placement: FloatingPlacement,
  arrowStyle?: CSSProperties,
  arrowSize = 8,
) {
  const halfArrow = arrowSize / 2;
  const horizontalArrowCenter =
    typeof arrowStyle?.left === "number" ? `${arrowStyle.left + halfArrow}px` : null;
  const verticalArrowCenter =
    typeof arrowStyle?.top === "number" ? `${arrowStyle.top + halfArrow}px` : null;

  if (placement.startsWith("top"))
    return `${horizontalArrowCenter ?? getHorizontalFallback(placement)} bottom`;
  if (placement.startsWith("bottom"))
    return `${horizontalArrowCenter ?? getHorizontalFallback(placement)} top`;
  if (placement.startsWith("left"))
    return `right ${verticalArrowCenter ?? getVerticalFallback(placement)}`;
  return `left ${verticalArrowCenter ?? getVerticalFallback(placement)}`;
}

interface FloatingPositionOptions {
  autoAdjustOverflow?: boolean;
  arrowSize?: number;
  edgeArrowCenter?: number;
  currentPlacement?: FloatingPlacement;
  recoverPreferredAxis?: boolean;
  placementHysteresis?: number;
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
    currentPlacement,
    recoverPreferredAxis = true,
    placementHysteresis = 12,
    targetGap = 9,
    viewportGap = 8,
  }: FloatingPositionOptions = {},
): FloatingPosition {
  const boundary = getViewportBoundary(viewportGap);
  const placements = autoAdjustOverflow
    ? getPlacementCandidates(target, requestedPlacement, boundary)
    : [requestedPlacement];
  const candidates = placements.map((placement, priority) => {
    const point = getPlacementPoint(target, popup, placement, targetGap);
    return {
      placement,
      point,
      priority,
      overflow: getOverflow(point, popup, boundary),
    };
  });
  const bestCandidate = candidates.reduce((current, candidate) => {
    if (candidate.overflow < current.overflow) return candidate;
    if (candidate.overflow === current.overflow && candidate.priority < current.priority)
      return candidate;
    return current;
  });
  const currentCandidate = currentPlacement
    ? candidates.find((candidate) => candidate.placement === currentPlacement)
    : undefined;
  const isVertical = (value: FloatingPlacement) =>
    value.startsWith("top") || value.startsWith("bottom");
  // A perpendicular fallback must be able to return to the requested axis.
  // Require spare room before returning, so edge-sized changes don't chatter.
  const recoveredCandidate =
    recoverPreferredAxis &&
    currentCandidate &&
    isVertical(currentCandidate.placement) !== isVertical(requestedPlacement)
      ? candidates.find((candidate) => {
          if (
            isVertical(candidate.placement) !== isVertical(requestedPlacement) ||
            candidate.overflow > 0
          )
            return false;
          const clearance = candidate.placement.startsWith("top")
            ? candidate.point.top - boundary.top
            : candidate.placement.startsWith("bottom")
              ? boundary.bottom - candidate.point.top - popup.height
              : candidate.placement.startsWith("left")
                ? candidate.point.left - boundary.left
                : boundary.right - candidate.point.left - popup.width;
          return clearance >= placementHysteresis;
        })
      : undefined;
  const best =
    recoveredCandidate ??
    (currentCandidate && currentCandidate.overflow <= bestCandidate.overflow + placementHysteresis
      ? currentCandidate
      : bestCandidate);

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
    arrowStyle: getArrowStyle(
      target,
      popup,
      placement,
      point,
      left,
      top,
      arrowSize,
      edgeArrowCenter,
    ),
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
  const perpendicularPlacements = getPerpendicularPlacements(
    target,
    requestedPlacement,
    boundary,
    vertical,
  );

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

function getPerpendicularPlacements(
  target: DOMRect,
  requestedPlacement: FloatingPlacement,
  boundary: FloatingBoundary,
  vertical: boolean,
): FloatingPlacement[] {
  if (vertical) {
    if (requestedPlacement.endsWith("Left")) return ["left", "right"];
    if (requestedPlacement.endsWith("Right")) return ["right", "left"];
    return boundary.right - target.right >= target.left - boundary.left
      ? ["right", "left"]
      : ["left", "right"];
  }

  if (requestedPlacement.endsWith("Top")) return ["top", "bottom"];
  if (requestedPlacement.endsWith("Bottom")) return ["bottom", "top"];
  return boundary.bottom - target.bottom >= target.top - boundary.top
    ? ["bottom", "top"]
    : ["top", "bottom"];
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
  idealPoint: { left: number; top: number },
  left: number,
  top: number,
  arrowSize: number,
  edgeArrowCenter: number,
): CSSProperties {
  const halfArrow = arrowSize / 2;
  const targetCenterX = target.left + target.width / 2 - left - halfArrow;
  const targetCenterY = target.top + target.height / 2 - top - halfArrow;
  const shiftedHorizontally = Math.abs(left - idealPoint.left) > 0.5;
  const shiftedVertically = Math.abs(top - idealPoint.top) > 0.5;
  const horizontalArrowPosition = shiftedHorizontally
    ? targetCenterX
    : placement.endsWith("Left")
      ? edgeArrowCenter - halfArrow
      : placement.endsWith("Right")
        ? popup.width - edgeArrowCenter - halfArrow
        : targetCenterX;
  const verticalArrowPosition = shiftedVertically
    ? targetCenterY
    : placement.endsWith("Top")
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

function getHorizontalFallback(placement: FloatingPlacement) {
  if (placement.endsWith("Left")) return "16px";
  if (placement.endsWith("Right")) return "calc(100% - 16px)";
  return "center";
}

function getVerticalFallback(placement: FloatingPlacement) {
  if (placement.endsWith("Top")) return "16px";
  if (placement.endsWith("Bottom")) return "calc(100% - 16px)";
  return "center";
}
