import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("toggles when its label is clicked", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="이용 약관에 동의" />);

    const checkbox = screen.getByRole("checkbox", { name: "이용 약관에 동의" });
    await user.click(screen.getByText("이용 약관에 동의"));

    expect(checkbox).toBeChecked();
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
    render(<Checkbox className="custom-checkbox" error />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.className).toContain("border-danger");
    expect(checkbox).not.toHaveClass("custom-checkbox");
    expect(checkbox.closest("label")).toHaveClass("custom-checkbox");
  });

  it("forwards native props and ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} data-testid="selection" name="selection" />);

    const checkbox = screen.getByTestId("selection");
    expect(checkbox).toHaveAttribute("name", "selection");
    expect(ref.current).toBe(checkbox);
  });

  it("displays the partially checked state", () => {
    render(<Checkbox partiallyChecked />);

    expect(screen.getByRole("checkbox")).toBePartiallyChecked();
  });

  it("preserves newlines in its label", () => {
    render(<Checkbox label={"첫 줄\n둘째 줄"} />);

    expect(screen.getByText(/첫 줄\s+둘째 줄/)).toHaveClass("whitespace-pre-line");
  });
});
