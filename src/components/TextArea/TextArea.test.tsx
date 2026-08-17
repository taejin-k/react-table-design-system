import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextArea } from "./TextArea";

function ValidatedTextArea() {
  const [value, setValue] = useState("짧음");
  return (
    <TextArea
      label="요청 내용"
      value={value}
      validate={(nextValue) =>
        nextValue.trim().length >= 10 ? "" : "요청 내용은 10자 이상 입력해 주세요."
      }
      onChange={setValue}
    />
  );
}

describe("TextArea", () => {
  it("updates an uncontrolled value and displays the count", async () => {
    const user = userEvent.setup();
    render(<TextArea label="소개" maxLength={5} showCount />);

    await user.type(screen.getByRole("textbox", { name: "소개" }), "안녕");
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("applies error and root styles", () => {
    const { container } = render(
      <TextArea label="소개" errorMessage="내용을 입력해 주세요." className="custom-root" />,
    );
    const textarea = screen.getByRole("textbox", { name: "소개" });
    const error = screen.getByRole("alert");
    expect(container.firstElementChild).toHaveClass("custom-root");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-describedby", error.id);
  });

  it("fills the parent by default and applies a custom width to the root", () => {
    const { container, rerender } = render(<TextArea aria-label="너비 입력" />);

    expect(container.firstElementChild).toHaveClass("w-full");

    rerender(<TextArea aria-label="너비 입력" width={320} />);
    expect(container.firstElementChild).toHaveStyle({ width: "320px" });

    rerender(<TextArea aria-label="너비 입력" width={240} />);
    expect(container.firstElementChild).toHaveStyle({ width: "240px" });
  });

  it("does not reserve error spacing when there is no error message", () => {
    const { container } = render(<TextArea aria-label="간격 입력" />);
    const root = container.firstElementChild;
    const errorRoot = container.querySelector('[role="alert"]')?.parentElement?.parentElement;

    expect(root).not.toHaveClass("gap-1");
    expect(errorRoot).not.toHaveClass("mt-1");
  });

  it("allows only the configured character type", () => {
    render(
      <>
        <TextArea aria-label="한글" allowOnly="korean" />
        <TextArea aria-label="영어" allowOnly="english" />
        <TextArea aria-label="숫자" allowOnly="number" />
      </>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "한글" }), {
      target: { value: "한글abc123" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "영어" }), {
      target: { value: "한글abc123" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "숫자" }), {
      target: { value: "한글abc123" },
    });

    expect(screen.getByRole("textbox", { name: "한글" })).toHaveValue("한글");
    expect(screen.getByRole("textbox", { name: "영어" })).toHaveValue("abc");
    expect(screen.getByRole("textbox", { name: "숫자" })).toHaveValue("123");
  });

  it("clears a validation error while typing and validates again on blur", async () => {
    const user = userEvent.setup();
    render(<ValidatedTextArea />);

    const textarea = screen.getByRole("textbox", { name: "요청 내용" });
    expect(textarea).toHaveAttribute("aria-invalid", "true");

    await user.clear(textarea);
    await user.type(textarea, "충분히 긴 요청 내용입니다");
    expect(textarea).not.toHaveAttribute("aria-invalid");

    await user.tab();
    expect(textarea).not.toHaveAttribute("aria-invalid");

    await user.click(textarea);
    await user.clear(textarea);
    await user.type(textarea, "짧음");
    expect(textarea).not.toHaveAttribute("aria-invalid");

    await user.tab();
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("handles asynchronous validation internally", async () => {
    const user = userEvent.setup();
    const validate = vi.fn(async (value: string) =>
      value === "이미 등록된 요청" ? "이미 등록된 요청이에요." : "",
    );
    render(<TextArea aria-label="요청 내용" defaultValue="이미 등록된 요청" validate={validate} />);

    const textarea = screen.getByRole("textbox", { name: "요청 내용" });
    await user.click(textarea);
    await user.tab();
    expect(await screen.findByText("이미 등록된 요청이에요.")).toBeInTheDocument();

    await user.click(textarea);
    await user.clear(textarea);
    await user.type(textarea, "새로운 요청");
    await waitFor(() => expect(textarea).not.toHaveAttribute("aria-invalid"));
  });

  it("passes the native focus event to onBlur", async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(<TextArea aria-label="요청 내용" onBlur={handleBlur} />);

    const textarea = screen.getByRole("textbox", { name: "요청 내용" });
    await user.click(textarea);
    await user.tab();

    expect(handleBlur).toHaveBeenCalledOnce();
    expect(handleBlur.mock.calls[0]?.[0].target).toBe(textarea);
  });

  it("places the count below the input without changing its height", () => {
    render(<TextArea showCount maxLength={20} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("resize-y");
    expect(textarea).not.toHaveClass("pb-7");
    expect(screen.getByText("0 / 20").parentElement).toHaveClass("absolute", "top-full");
  });

  it("hides the resize handle when resize is false", () => {
    render(<TextArea resize={false} />);

    expect(screen.getByRole("textbox")).toHaveClass("resize-none");
  });

  it("applies the filled variant used by Input", () => {
    const { container } = render(<TextArea variant="filled" />);
    const root = container.querySelector("textarea")?.parentElement;
    expect(root).toHaveClass("bg-[#f5f5f5]");
    expect(root).toHaveClass("ring-[#f5f5f5]");
    expect(root).not.toHaveClass("bg-white");
  });

  it("starts auto size at one row without the fixed size minimum height", () => {
    render(<TextArea autoSize={{ minRows: 1, maxRows: 6 }} />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "1");
    expect(textarea).toHaveClass("resize-none");
    expect(textarea).not.toHaveClass("min-h-20");
  });

  it("uses the design-system scrollbar inside the input area", () => {
    render(<TextArea />);

    expect(screen.getByRole("textbox")).toHaveAttribute("data-textarea-scroll-container");
  });
});
