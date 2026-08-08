import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("applies hover styles only when onClick is provided", () => {
    const { rerender } = render(<Icon data-testid="icon" icon="edit" />);

    expect(screen.getByTestId("icon")).not.toHaveClass("hover:opacity-75");

    rerender(<Icon data-testid="icon" icon="edit" onClick={vi.fn()} />);
    expect(screen.getByTestId("icon")).toHaveClass("cursor-pointer", "hover:opacity-75");
  });

  it.each(["Enter", " "])("activates with %s", async (key) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Icon icon="delete" aria-label="삭제" onClick={onClick} />);

    screen.getByRole("button", { name: "삭제" }).focus();
    await user.keyboard(key === "Enter" ? "{Enter}" : " ");
    expect(onClick).toHaveBeenCalledOnce();
  });
});
