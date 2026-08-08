import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

function InputHarness() {
  const [value, setValue] = useState("검색어");
  return <Input label="검색" value={value} onChange={setValue} allowClear />;
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
      onBlur={(currentValue) => {
        setErrorText(
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValue) ? "" : "올바른 이메일을 입력하세요",
        );
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

    await user.click(screen.getByRole("button", { name: "입력 내용 지우기" }));

    expect(screen.getByRole("textbox", { name: "검색" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "검색" })).toHaveFocus();
  });

  it("applies className to the root", () => {
    const { container } = render(<Input aria-label="스타일 입력" className="custom-root" />);

    expect(container.firstElementChild).toHaveClass("custom-root");
  });
});
