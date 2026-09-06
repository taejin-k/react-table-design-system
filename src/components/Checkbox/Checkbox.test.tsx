import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("uses the danger color for partial selection with error", () => {
    render(<Checkbox partiallyChecked error />);
    expect(screen.getByRole("checkbox")).toHaveClass(
      "indeterminate:border-danger",
      "indeterminate:bg-danger",
    );
    expect(screen.getByRole("checkbox")).not.toHaveClass("indeterminate:bg-primary");
  });

  it("toggles when its label is clicked", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="이용 약관에 동의" />);

    const checkbox = screen.getByRole("checkbox", { name: "이용 약관에 동의" });
    await user.click(screen.getByText("이용 약관에 동의"));

    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveClass("transition-[background-color,border-color]", "duration-200");
    expect(document.querySelector("[data-checkbox-mark]")).toHaveClass(
      "size-3",
      "-translate-x-1/2",
      "-translate-y-1/2",
      "transition-[color,opacity,transform]",
      "duration-200",
      "peer-checked:opacity-100",
    );
  });

  it("does not toggle or call onChange when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox disabled label="비활성" onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox", { name: "비활성" });
    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("applies the error variant to the input and an external class to the root", () => {
    render(<Checkbox className="custom-checkbox" defaultChecked error />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("checked:border-danger", "checked:bg-danger");
    expect(checkbox).not.toHaveClass("checked:border-primary", "checked:bg-primary");
    expect(checkbox).not.toHaveClass("custom-checkbox");
    expect(checkbox.closest("label")).toHaveClass("custom-checkbox");
  });

  it("forwards native props and ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} data-testid="selection" name="selection" />);

    const checkbox = screen.getByTestId("selection");
    expect(checkbox).toHaveAttribute("name", "selection");
    expect(checkbox).toHaveClass("block");
    expect(ref.current).toBe(checkbox);
    expect(checkbox.parentElement).not.toHaveClass("-mt-px");
    expect(checkbox.closest("label")).toHaveClass("select-none");
  });

  it("displays the partially checked state", () => {
    render(<Checkbox partiallyChecked />);

    expect(screen.getByRole("checkbox")).toBePartiallyChecked();
    expect(document.querySelector("[data-checkbox-mark] path")).toHaveAttribute("d", "M3 6h6");
  });

  it("preserves newlines in its label", () => {
    render(<Checkbox label={"첫 줄\n둘째 줄"} />);

    expect(screen.getByText(/첫 줄\s+둘째 줄/)).toHaveClass("whitespace-pre-line");
  });

  it("wraps continuous English letters and numbers in its label", () => {
    render(<Checkbox label="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" />);

    const labelText = screen.getByText("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
    expect(labelText).toHaveClass("min-w-0", "break-all");
    expect(labelText.closest("label")).toHaveClass("max-w-full", "min-w-0");
  });
});
