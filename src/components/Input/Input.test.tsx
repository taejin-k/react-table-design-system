import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

function InputHarness() {
  const [value, setValue] = useState("검색어");
  return <Input label="검색" value={value} onChange={setValue} allowClear />;
}

function UncontrolledInputHarness() {
  return <Input label="검색" defaultValue="검색어" allowClear />;
}

function EmailInputHarness() {
  const [value, setValue] = useState("email");
  const [errorText, setErrorText] = useState("올바른 이메일을 입력하세요");
  return (
    <Input
      label="이메일"
      value={value}
      required
      errorText={errorText}
      onBlur={() => {
        setErrorText(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "올바른 이메일을 입력하세요");
      }}
      onChange={setValue}
      onError={setErrorText}
    />
  );
}

describe("Input", () => {
  it("connects required and error semantics to the native input", () => {
    render(
      <Input label="이메일" value="invalid" required errorText="올바른 이메일을 입력하세요" />,
    );

    const input = screen.getByRole("textbox", { name: "이메일" });
    const error = screen.getByRole("alert");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", error.id);
  });

  it("clears the error while typing and validates again on blur", async () => {
    const user = userEvent.setup();
    render(<EmailInputHarness />);

    const input = screen.getByRole("textbox", { name: "이메일" });
    expect(input).toHaveAttribute("aria-invalid", "true");

    await user.clear(input);
    await user.type(input, "user@example.com");
    expect(input).not.toHaveAttribute("aria-invalid");

    await user.tab();
    expect(input).not.toHaveAttribute("aria-invalid");

    await user.click(input);
    await user.clear(input);
    await user.type(input, "invalid");
    expect(input).not.toHaveAttribute("aria-invalid");

    await user.tab();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("clears the value and restores focus to the input", async () => {
    const user = userEvent.setup();
    render(<InputHarness />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("textbox", { name: "검색" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "검색" })).toHaveFocus();
  });

  it("clears an uncontrolled default value", async () => {
    const user = userEvent.setup();
    render(<UncontrolledInputHarness />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("textbox", { name: "검색" })).toHaveValue("");
  });

  it("shows the character count only when showCount is enabled", () => {
    const { rerender } = render(<Input defaultValue="검색" maxLength={10} />);

    expect(screen.queryByText("2 / 10")).not.toBeInTheDocument();

    rerender(<Input defaultValue="검색" maxLength={10} showCount />);
    expect(screen.getByText("2 / 10")).toBeInTheDocument();
  });

  it("applies className to the root", () => {
    const { container } = render(<Input aria-label="스타일 입력" className="custom-root" />);

    expect(container.firstElementChild).toHaveClass("custom-root");
  });

  it("applies the filled background without retaining the default background", () => {
    const { container } = render(<Input variant="filled" />);
    const inputRow = container.querySelector("input")?.parentElement;

    expect(inputRow).toHaveClass("bg-[#f5f5f5]");
    expect(inputRow).not.toHaveClass("bg-white");
  });

  it("calls onEnter when Enter is pressed", async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<Input aria-label="검색어" defaultValue="검색어" onEnter={handleEnter} />);

    await user.type(screen.getByRole("textbox", { name: "검색어" }), "{Enter}");

    expect(handleEnter).toHaveBeenCalledOnce();
  });
});
