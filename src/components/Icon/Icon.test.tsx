import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Icon, iconNames } from "./Icon";

describe("Icon", () => {
  it("renders every supported icon", () => {
    const { container } = render(
      <>
        {iconNames.map((icon) => (
          <Icon key={icon} data-icon={icon} icon={icon} />
        ))}
      </>,
    );

    expect(container.querySelectorAll("svg")).toHaveLength(iconNames.length);
    expect(container.querySelectorAll("path").length).toBeGreaterThanOrEqual(iconNames.length);
    expect(container.querySelectorAll("g")).toHaveLength(iconNames.length);
  });

  it("normalizes each glyph within the shared 16px canvas", () => {
    const { container } = render(
      <>
        <Icon icon="info" />
        <Icon icon="drag-handle" />
        <Icon icon="users" />
      </>,
    );

    expect(
      Array.from(container.querySelectorAll("g")).map((group) => group.getAttribute("transform")),
    ).toEqual([
      "translate(8 8) scale(0.9) translate(-8 -8)",
      "translate(8 8) scale(1.05) translate(-8 -8)",
      "translate(8 8) scale(0.75) translate(-8 -8)",
    ]);
  });

  it.each(["chevron-left", "chevron-right"] as const)("renders the %s icon", (icon) => {
    const { container } = render(<Icon icon={icon} />);

    expect(container.querySelector("path")).toHaveAttribute("d");
  });

  it("animates the loading icon", () => {
    render(<Icon data-testid="icon" icon="loading" />);

    expect(screen.getByTestId("icon")).toHaveClass("animate-spin", "motion-reduce:animate-none");
  });

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
