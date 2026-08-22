import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Icon, iconGalleryNames, iconNames } from "./Icon";

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

  it("does not throw when an invalid runtime icon value is provided", () => {
    const { container } = render(<Icon icon={undefined as never} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("uses style suffixes only when both outlined and filled variants exist", () => {
    expect(iconNames).toContain("arrow-down");
    expect(iconGalleryNames).not.toContain("arrow-down-outlined" as never);
    expect(iconGalleryNames).toContain("drag-handle");
    expect(iconGalleryNames).not.toContain("drag-handle-filled" as never);
    expect(iconGalleryNames).toContain("heart-outlined");
    expect(iconGalleryNames).toContain("heart-filled");
    expect(iconGalleryNames).not.toContain("eye-filled");
    expect(iconGalleryNames).not.toContain("calendar-filled");
    expect(iconNames).not.toContain("eye-filled");
    expect(iconNames).not.toContain("calendar-filled");
    expect(new Set(iconGalleryNames).size).toBe(iconGalleryNames.length);
  });

  it("uses the existing 16px path renderer for new filled icons", () => {
    const { container } = render(<Icon icon="check-circle-filled" />);

    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 16 16");
    expect(container.querySelector("path")).toHaveAttribute("fill-rule", "evenodd");
  });

  it("inherits the surrounding text color by default", () => {
    const { container } = render(<Icon icon="check" />);

    expect(container.querySelector("path")).toHaveAttribute("fill", "currentColor");
  });

  it("keeps per-glyph optical sizing when rendered at 12px", () => {
    const { container } = render(
      <>
        <Icon icon="info-circle-outlined" size={12} />
        <Icon icon="drag-handle" size={12} />
        <Icon icon="users-outlined" size={12} />
      </>,
    );

    expect(
      Array.from(container.querySelectorAll("svg")).map((icon) => icon.getAttribute("width")),
    ).toEqual(["12", "12", "12"]);
    expect(
      Array.from(container.querySelectorAll("g")).map((group) => group.getAttribute("transform")),
    ).toEqual([
      "translate(8 8) scale(0.96) translate(-8 -8)",
      "translate(8 8) scale(1.05) translate(-8 -8)",
      "translate(8 8) scale(0.9) translate(-8 -8)",
    ]);
  });

  it("shrinks visually dominant diagonal glyphs", () => {
    const { container } = render(<Icon icon="close" />);

    expect(container.querySelector("g")).toHaveAttribute(
      "transform",
      "translate(8 8) scale(0.88) translate(-8 -8)",
    );
  });

  it.each(["chevron-left", "chevron-right"] as const)("renders the %s icon", (icon) => {
    const { container } = render(<Icon icon={icon} />);

    expect(container.querySelector("path")).toHaveAttribute("d");
  });

  it("animates the loading icon", () => {
    render(<Icon data-testid="icon" icon="loading" />);

    expect(screen.getByTestId("icon")).toHaveClass("animate-spin", "motion-reduce:animate-none");
  });

  it("replaces the requested icon and blocks interactions while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Icon data-testid="icon" color="#fe5150" icon="delete-outlined" loading onClick={onClick} />,
    );

    const icon = screen.getByTestId("icon");
    expect(icon).toHaveClass("animate-spin", "cursor-default");
    expect(icon).not.toHaveClass("cursor-pointer", "hover:opacity-75");
    expect(icon).not.toHaveAttribute("tabindex");
    expect(container.querySelector("path")).toHaveAttribute("d", expect.stringContaining("1.333"));
    expect(container.querySelector("path")).toHaveAttribute("fill", "#fe5150");

    await user.click(icon);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps the requested size inside flex layouts", () => {
    render(<Icon data-testid="icon" icon="add" size={48} />);

    expect(screen.getByTestId("icon")).toHaveAttribute("width", "48");
    expect(screen.getByTestId("icon")).toHaveAttribute("height", "48");
    expect(screen.getByTestId("icon")).toHaveClass("shrink-0");
  });

  it("applies hover styles only when onClick is provided", () => {
    const { rerender } = render(<Icon data-testid="icon" icon="edit" />);

    expect(screen.getByTestId("icon")).not.toHaveClass("hover:opacity-75");

    rerender(<Icon data-testid="icon" icon="edit" onClick={vi.fn()} />);
    expect(screen.getByTestId("icon")).toHaveClass(
      "cursor-pointer",
      "hover:opacity-75",
      "focus-visible:outline-none",
    );
    expect(screen.getByTestId("icon")).toHaveStyle({ outline: "none" });
  });

  it.each(["Enter", " "])("activates with %s", async (key) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Icon data-testid="icon" icon="delete-outlined" onClick={onClick} />);

    screen.getByTestId("icon").focus();
    await user.keyboard(key === "Enter" ? "{Enter}" : " ");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("blocks pointer and keyboard activation when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <Icon data-testid="icon" color="#fe5150" disabled icon="delete-outlined" onClick={onClick} />,
    );

    const icon = screen.getByTestId("icon");
    expect(icon).toHaveClass("cursor-not-allowed");
    expect(icon).not.toHaveClass("opacity-40");
    expect(icon).not.toHaveClass("cursor-pointer", "hover:opacity-75");
    expect(icon).not.toHaveAttribute("tabindex");
    expect(container.querySelector("path")).toHaveAttribute("fill", "#aaa");

    await user.click(icon);
    expect(onClick).not.toHaveBeenCalled();
  });
});
