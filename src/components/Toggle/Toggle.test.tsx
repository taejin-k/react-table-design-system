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
});
