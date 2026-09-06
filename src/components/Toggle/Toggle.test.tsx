import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("uses a button and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);

    const toggle = screen.getByRole("button");
    expect(toggle).toHaveAttribute("type", "button");
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("respects a consumer click cancellation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Toggle checked={false} onChange={onChange} onClick={(event) => event.preventDefault()} />,
    );

    await user.click(screen.getByRole("button"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows a size-matched loading icon and blocks interactions while loading", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <Toggle checked loading onChange={onChange} onClick={onClick} size="lg" />,
    );

    const toggle = screen.getByRole("button");
    const loadingIconWrapper = container.querySelector("[data-toggle-loading-icon]");
    const loadingIcon = loadingIconWrapper?.querySelector("svg");
    expect(toggle).toHaveClass(
      "cursor-default",
      "bg-primary",
      "opacity-70",
      "transition-[background-color,opacity]",
      "duration-200",
    );
    expect(loadingIconWrapper).toHaveClass("transition-opacity", "duration-200", "opacity-100");
    expect(loadingIcon).toHaveAttribute("width", "20");
    expect(loadingIcon).toHaveAttribute("height", "20");
    expect(loadingIcon).toHaveClass("animate-spin");
    expect(loadingIcon?.querySelector("path")).toHaveAttribute("fill", "var(--color-primary)");

    await user.click(toggle);
    expect(onClick).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("animates the loading icon out without immediately removing it", () => {
    const { container, rerender } = render(<Toggle checked={false} loading />);
    const toggle = screen.getByRole("button");
    const loadingIconWrapper = container.querySelector("[data-toggle-loading-icon]");
    const loadingIcon = loadingIconWrapper?.querySelector("svg");

    expect(toggle).toHaveClass("bg-border", "opacity-70");

    rerender(<Toggle checked={false} loading={false} />);

    expect(toggle).toHaveClass("bg-border");
    expect(toggle).not.toHaveClass("opacity-70");
    expect(container.querySelector("[data-toggle-loading-icon]")).toBe(loadingIconWrapper);
    expect(loadingIconWrapper).toHaveClass("duration-200", "opacity-0");
    expect(loadingIconWrapper).not.toHaveClass("scale-75");
    expect(loadingIcon).toHaveClass("animate-spin");
  });

  it("changes thumb size immediately while keeping checked transitions", () => {
    const { rerender } = render(<Toggle checked size="sm" />);

    const toggle = screen.getByRole("button");
    const smallThumb = toggle.firstElementChild;
    expect(smallThumb).toHaveClass("size-[14px]", "transition-[left]");

    rerender(<Toggle checked={false} size="sm" />);
    expect(toggle.firstElementChild).toBe(smallThumb);
    expect(toggle.firstElementChild).toHaveClass("left-[3px]", "transition-[left]");

    rerender(<Toggle checked={false} size="lg" />);
    expect(toggle.firstElementChild).not.toBe(smallThumb);
    expect(toggle.firstElementChild).toHaveClass("size-[24px]", "left-[3px]");
  });
});
