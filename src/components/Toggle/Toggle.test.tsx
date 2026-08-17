import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("keeps its switch semantics and calls onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle aria-label="알림" checked={false} onChange={onChange} />);

    const toggle = screen.getByRole("switch", { name: "알림" });
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("respects a consumer click cancellation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Toggle
        aria-label="알림"
        checked={false}
        onChange={onChange}
        onClick={(event) => event.preventDefault()}
      />,
    );

    await user.click(screen.getByRole("switch", { name: "알림" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows a size-matched loading icon and blocks interactions while loading", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <Toggle checked loading onChange={onChange} onClick={onClick} size="lg" />,
    );

    const toggle = screen.getByRole("switch");
    const loadingIcon = container.querySelector("svg");
    expect(toggle).toHaveClass("cursor-default", "bg-[#6ea0fa]");
    expect(loadingIcon).toHaveAttribute("width", "20");
    expect(loadingIcon).toHaveAttribute("height", "20");
    expect(loadingIcon).toHaveClass("animate-spin");
    expect(loadingIcon?.querySelector("path")).toHaveAttribute("fill", "#6ea0fa");

    await user.click(toggle);
    expect(onClick).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
