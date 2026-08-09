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
    expect(button).toHaveClass("bg-[#0062df]", "h-[30px]");
    expect(ref.current).toBe(button);
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

  it("keeps icon interaction owned by the button", async () => {
    const user = userEvent.setup();
    const iconClick = vi.fn();
    const buttonClick = vi.fn();
    render(
      <Button
        aria-label="추가"
        iconOnly
        prefixIcon={<span data-testid="icon" onClick={iconClick} />}
        onClick={buttonClick}
      />,
    );

    const button = screen.getByRole("button", { name: "추가" });
    expect(button).toHaveClass("w-[30px]", "px-0");
    await user.click(screen.getByTestId("icon"));
    expect(buttonClick).toHaveBeenCalledOnce();
    expect(iconClick).not.toHaveBeenCalled();
  });
});
