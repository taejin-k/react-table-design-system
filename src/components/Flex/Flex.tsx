import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import type { FlexProps } from "./Flex.types";

const gapMap = { small: 8, medium: 16, large: 24 } as const;

export const Flex = forwardRef<HTMLElement, FlexProps>(
  (
    {
      component: Component = "div",
      vertical,
      orientation,
      wrap = "nowrap",
      justify = "normal",
      align = "normal",
      flex = "normal",
      gap,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const direction = orientation ?? (vertical ? "vertical" : "horizontal");
    const resolvedWrap = wrap === true ? "wrap" : wrap === false ? "nowrap" : wrap;
    const resolvedGap =
      typeof gap === "string" && gap in gapMap ? gapMap[gap as keyof typeof gapMap] : gap;

    return (
      <Component
        ref={ref}
        className={twMerge("flex min-w-0", direction === "vertical" && "flex-col", className)}
        style={{
          flexWrap: resolvedWrap,
          justifyContent: justify,
          alignItems: align,
          flex,
          gap: resolvedGap,
          ...style,
        }}
        {...rest}
      />
    );
  },
);

Flex.displayName = "Flex";
