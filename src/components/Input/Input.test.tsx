import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  return (
    <Input
      label="이메일"
      value={value}
      required
      validate={(nextValue) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextValue) ? "" : "올바른 이메일을 입력하세요"
      }
      onChange={setValue}
    />
  );
}

describe("Input", () => {
  it("applies required state and displays an error", () => {
    render(
      <Input label="이메일" value="invalid" required errorMessage="올바른 이메일을 입력하세요" />,
    );

    const input = screen.getByLabelText(/이메일/);
    expect(input).toBeRequired();
    expect(screen.getByText("올바른 이메일을 입력하세요")).toBeInTheDocument();
  });

  it("clears the error while typing and validates again on blur", async () => {
    const user = userEvent.setup();
    render(<EmailInputHarness />);

    const input = screen.getByLabelText(/이메일/);
    expect(screen.getByText("올바른 이메일을 입력하세요")).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "user@example.com");
    await waitFor(() =>
      expect(screen.queryByText("올바른 이메일을 입력하세요")).not.toBeInTheDocument(),
    );

    await user.tab();
    expect(screen.queryByText("올바른 이메일을 입력하세요")).not.toBeInTheDocument();

    await user.click(input);
    await user.clear(input);
    await user.type(input, "invalid");
    await waitFor(() =>
      expect(screen.queryByText("올바른 이메일을 입력하세요")).not.toBeInTheDocument(),
    );

    await user.tab();
    expect(screen.getByText("올바른 이메일을 입력하세요")).toBeInTheDocument();
  });

  it("handles asynchronous validation internally and clears its error while typing", async () => {
    const user = userEvent.setup();
    const validate = vi.fn(async (nextValue: string) =>
      nextValue === "used@example.com" ? "이미 가입된 이메일이에요." : "",
    );
    render(<Input placeholder="이메일" defaultValue="used@example.com" validate={validate} />);

    const input = screen.getByPlaceholderText("이메일");

    await user.click(input);
    await user.tab();
    expect(await screen.findByText("이미 가입된 이메일이에요.")).toBeInTheDocument();

    await user.click(input);
    await user.clear(input);
    await user.type(input, "available@example.com");
    await waitFor(() =>
      expect(screen.queryByText("이미 가입된 이메일이에요.")).not.toBeInTheDocument(),
    );

    await user.tab();
    await waitFor(() =>
      expect(screen.queryByText("이미 가입된 이메일이에요.")).not.toBeInTheDocument(),
    );
  });

  it("clears the value and restores focus to the input", async () => {
    const user = userEvent.setup();
    const { container } = render(<InputHarness />);

    await user.click(container.querySelector("svg") as SVGSVGElement);

    expect(screen.getByRole("textbox", { name: "검색" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "검색" })).toHaveFocus();
  });

  it("clears an uncontrolled default value", async () => {
    const user = userEvent.setup();
    const { container } = render(<UncontrolledInputHarness />);

    await user.click(container.querySelector("svg") as SVGSVGElement);

    expect(screen.getByRole("textbox", { name: "검색" })).toHaveValue("");
  });

  it("keeps a read-only value focusable without showing the clear action", async () => {
    const user = userEvent.setup();
    render(<Input defaultValue="입력값" readOnly allowClear />);

    const input = screen.getByDisplayValue("입력값");
    expect(input).toHaveAttribute("readonly");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    await user.click(input);
    expect(input).toHaveFocus();
  });

  it("shows the character count only when showCount is enabled", () => {
    const { rerender } = render(<Input defaultValue="검색" maxLength={10} />);

    expect(screen.queryByText("2 / 10")).not.toBeInTheDocument();

    rerender(<Input defaultValue="검색" maxLength={10} showCount />);
    expect(screen.getByText("2 / 10")).toBeInTheDocument();
  });

  it("applies className to the root", () => {
    const { container } = render(<Input className="custom-root" />);

    expect(container.firstElementChild).toHaveClass("custom-root");
  });

  it("fills the parent by default and applies a custom width to the root", () => {
    const { container, rerender } = render(<Input />);

    expect(container.firstElementChild).toHaveClass("w-full");

    rerender(<Input width={320} />);
    expect(container.firstElementChild).toHaveStyle({ width: "320px" });

    rerender(<Input width={240} />);
    expect(container.firstElementChild).toHaveStyle({ width: "240px" });
  });

  it("does not reserve error spacing when there is no error message", () => {
    const { container } = render(<Input />);
    const root = container.firstElementChild;
    const errorRoot = root?.lastElementChild;

    expect(root).not.toHaveClass("gap-[4px]");
    expect(errorRoot).not.toHaveClass("mt-0.5");
  });

  it("allows only the configured character type", () => {
    render(
      <>
        <Input placeholder="한글" allowOnly="korean" />
        <Input placeholder="영어" allowOnly="english" />
        <Input placeholder="숫자" allowOnly="number" />
      </>,
    );

    fireEvent.change(screen.getByPlaceholderText("한글"), {
      target: { value: "한글abc123" },
    });
    fireEvent.change(screen.getByPlaceholderText("영어"), {
      target: { value: "한글abc123" },
    });
    fireEvent.change(screen.getByPlaceholderText("숫자"), {
      target: { value: "한글abc123" },
    });

    expect(screen.getByPlaceholderText("한글")).toHaveValue("한글");
    expect(screen.getByPlaceholderText("영어")).toHaveValue("abc");
    expect(screen.getByPlaceholderText("숫자")).toHaveValue("123");
    expect(screen.getByPlaceholderText("숫자")).toHaveAttribute("inputmode", "numeric");
  });

  it("applies the filled background without retaining the default background", () => {
    const { container } = render(<Input variant="filled" />);
    const inputRow = container.querySelector("input")?.parentElement;

    expect(inputRow).toHaveClass("bg-hover");
    expect(inputRow).not.toHaveClass("bg-white");
  });

  it("applies borderless and underlined variants", () => {
    const { container, rerender } = render(<Input variant="borderless" />);
    let inputRow = container.querySelector("input")?.parentElement;

    expect(inputRow).toHaveClass("border-transparent");

    rerender(<Input variant="underlined" />);
    inputRow = container.querySelector("input")?.parentElement;

    expect(inputRow).toHaveClass(
      "rounded-none",
      "border-x-transparent",
      "border-t-transparent",
      "border-b-border",
    );
    expect(inputRow).not.toHaveClass("border-x-0", "border-t-0");
  });

  it("restores the full rounded border when an underlined input is disabled", () => {
    const { container } = render(<Input variant="underlined" disabled />);
    const inputRow = container.querySelector("input")?.parentElement;

    expect(inputRow).toHaveClass(
      "rounded-[4px]",
      "border-border",
      "border-x-border",
      "border-t-border",
      "bg-hover",
    );
    expect(inputRow).not.toHaveClass("rounded-none");
  });

  it("shows only a red bottom border when an underlined input has an error", () => {
    const { container } = render(
      <Input variant="underlined" errorMessage="이미 가입된 이메일이에요." />,
    );
    const inputRow = container.querySelector("input")?.parentElement;

    expect(inputRow).toHaveClass(
      "rounded-none",
      "border-x-transparent",
      "border-t-transparent",
      "border-b-danger",
    );
    expect(inputRow).not.toHaveClass("border-danger");
  });

  it("calls onEnter when Enter is pressed", async () => {
    const user = userEvent.setup();
    const handleEnter = vi.fn();
    render(<Input defaultValue="검색어" onEnter={handleEnter} />);

    await user.type(screen.getByDisplayValue("검색어"), "{Enter}");

    expect(handleEnter).toHaveBeenCalledOnce();
  });

  it("passes the native focus event to onBlur", async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(<Input placeholder="검색어" onBlur={handleBlur} />);

    const input = screen.getByPlaceholderText("검색어");
    await user.click(input);
    await user.tab();

    expect(handleBlur).toHaveBeenCalledOnce();
    expect(handleBlur.mock.calls[0]?.[0].target).toBe(input);
  });

  it("toggles a password value between hidden and visible", async () => {
    const user = userEvent.setup();
    const { container } = render(<Input label="비밀번호" defaultValue="password" password />);

    const input = screen.getByLabelText("비밀번호");
    expect(input).toHaveAttribute("type", "password");

    await user.click(container.querySelector("svg") as SVGSVGElement);
    expect(input).toHaveAttribute("type", "text");

    await user.click(container.querySelector("svg") as SVGSVGElement);
    expect(input).toHaveAttribute("type", "password");
  });

  it("keeps password glyph sizing consistent when disabled", () => {
    render(<Input label="비밀번호" defaultValue="password" password disabled />);

    const input = screen.getByLabelText("비밀번호");
    expect(input).toHaveClass("text-[14px]", "font-medium", "opacity-100");
    expect(input).not.toHaveClass("font-normal");
  });
});
