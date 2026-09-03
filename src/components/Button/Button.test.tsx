import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("uses safe defaults and forwards native props and ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} data-testid="button" name="save">
        저장
      </Button>,
    );

    const button = screen.getByRole("button", { name: "저장" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("name", "save");
    expect(button).toHaveClass("bg-primary", "h-[30px]", "whitespace-nowrap");
    expect(ref.current).toBe(button);
  });

  it("supports the native button type prop", () => {
    render(<Button type="submit">저장</Button>);

    expect(screen.getByRole("button", { name: "저장" })).toHaveAttribute("type", "submit");
  });

  it("runs its click handler unless disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>실행</Button>);

    await user.click(screen.getByRole("button", { name: "실행" }));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(
      <Button disabled onClick={onClick}>
        실행
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "실행" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("uses a transparent background and the tertiary background when a ghost button is hovered", () => {
    const { rerender } = render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByRole("button", { name: "Ghost" });
    expect(button).toHaveClass("bg-transparent", "hover:bg-[#f5f5f5]", "ring-transparent");

    rerender(
      <Button variant="ghost" loading>
        Ghost
      </Button>,
    );
    expect(button).toHaveClass("bg-transparent", "hover:bg-transparent");
  });

  it("uses the secondary border color when a tertiary button is hovered", () => {
    render(<Button variant="tertiary">Tertiary</Button>);

    expect(screen.getByRole("button", { name: "Tertiary" })).toHaveClass(
      "ring-transparent",
      "hover:ring-[#ddd]",
    );
  });

  it("uses danger colors without a separate pressed color", () => {
    const { rerender } = render(<Button variant="danger">삭제</Button>);

    const button = screen.getByRole("button", { name: "삭제" });
    expect(button).toHaveClass("bg-danger", "text-white", "hover:bg-danger-hover");
    expect(button).not.toHaveClass("active:bg-[#d9363e]");

    rerender(
      <Button variant="danger" loading>
        삭제
      </Button>,
    );
    expect(button).toHaveClass("hover:bg-danger");
    expect(button.className).not.toContain("active:bg");

    rerender(
      <Button variant="danger" disabled>
        삭제
      </Button>,
    );
    expect(button).toHaveClass(
      "disabled:bg-[#f5f5f5]",
      "disabled:text-[#999999]",
      "disabled:ring-[#dddddd]",
    );
  });

  it("keeps icon interaction owned by the button", async () => {
    const user = userEvent.setup();
    const iconClick = vi.fn();
    const buttonClick = vi.fn();
    render(
      <Button
        iconOnly
        prefixIcon={<span data-testid="icon" onClick={iconClick} />}
        onClick={buttonClick}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-[30px]", "px-0");
    await user.click(screen.getByTestId("icon"));
    expect(buttonClick).toHaveBeenCalledOnce();
    expect(iconClick).not.toHaveBeenCalled();
  });

  it("keeps icon-only buttons square while loading", () => {
    render(<Button iconOnly loading prefixIcon={<span />} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-[30px]", "w-[30px]", "px-0");
    expect(button.style.width).toBe("");
  });

  it("changes icon-only sizes without a width transition", () => {
    const { rerender } = render(<Button iconOnly size="sm" prefixIcon={<span />} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-5", "transition-[opacity,color,background-color,box-shadow]");
    expect(button).not.toHaveClass("transition-[width,opacity,color,background-color,box-shadow]");

    rerender(<Button iconOnly size="lg" prefixIcon={<span />} />);
    expect(button).toHaveClass("w-10", "transition-[opacity,color,background-color,box-shadow]");
  });

  it("applies a border radius equal to each button height when rounded", () => {
    const { rerender } = render(
      <Button rounded size="lg">
        Large
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Large" })).toHaveClass("h-10", "rounded-[40px]");

    rerender(
      <Button rounded size="md">
        Medium
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Medium" })).toHaveClass(
      "h-[30px]",
      "rounded-[30px]",
    );

    rerender(
      <Button rounded size="sm">
        Small
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Small" })).toHaveClass("h-5", "rounded-[20px]");
  });

  it("replaces the expected icon slot while loading and blocks clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <Button
        loading
        prefixIcon={<span data-testid="prefix" />}
        suffixIcon={<span data-testid="suffix" />}
        onClick={onClick}
      >
        저장
      </Button>,
    );

    const button = screen.getByRole("button", { name: "저장" });
    expect(button).toHaveClass(
      "cursor-default",
      "bg-primary-loading",
      "opacity-100",
      "hover:bg-primary-loading",
    );
    expect(screen.getByTestId("prefix")).toBeInTheDocument();
    expect(screen.queryByTestId("suffix")).not.toBeInTheDocument();
    expect(button.querySelector("svg")).toHaveClass("animate-spin");

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <Button loading prefixIcon={<span data-testid="prefix" />}>
        저장
      </Button>,
    );
    expect(screen.queryByTestId("prefix")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" }).querySelector("svg")).toHaveClass(
      "animate-spin",
    );
  });

  it("scales shadow range and intensity with the button size", () => {
    const { rerender } = render(
      <Button size="sm" shadow>
        Small
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("shadow-[0_1px_2px_rgba(0,0,0,0.12)]");

    rerender(
      <Button size="md" shadow>
        Medium
      </Button>,
    );
    expect(button).toHaveClass("shadow-[0_2px_4px_rgba(0,0,0,0.16)]");

    rerender(
      <Button size="lg" shadow>
        Large
      </Button>,
    );
    expect(button).toHaveClass("shadow-[0_3px_6px_rgba(0,0,0,0.20)]");
  });

  it("keeps text children on one line", () => {
    render(<Button>{"첫 줄\n둘째 줄"}</Button>);

    expect(screen.getByRole("button")).toHaveClass("h-[30px]", "whitespace-nowrap");
  });
});
