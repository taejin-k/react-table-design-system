import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import type { FlexProps } from "./Flex.types";

export const Flex = forwardRef<HTMLElement, FlexProps>(
  (
    {
      component: Component = "div",
      vertical,
      wrap = "nowrap",
      justify,
      align,
      flex,
      gap,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const resolvedWrap = wrap === true ? "wrap" : wrap === false ? "nowrap" : wrap;
    return (
      <Component
        ref={ref}
        className={twMerge("flex min-w-0", vertical && "flex-col", className)}
        style={{
          flexWrap: resolvedWrap,
          justifyContent: justify,
          alignItems: align,
          flex,
          gap,
          ...style,
        }}
        {...rest}
      />
    );
  },
);

Flex.displayName = "Flex";
