import { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextArea } from "./TextArea";

function ValidatedTextArea() {
  const [value, setValue] = useState("짧음");
  return (
    <TextArea
      label="요청 내용"
      value={value}
      errorMessage={(nextValue) =>
        nextValue.trim().length >= 10 ? "" : "요청 내용은 10자 이상 입력해 주세요."
      }
      onChange={setValue}
    />
  );
}

describe("TextArea", () => {
  it("updates an uncontrolled value and displays the count", async () => {
    const user = userEvent.setup();
    const { container } = render(<TextArea label="소개" maxLength={5} showCount />);

    await user.type(screen.getByRole("textbox", { name: "소개" }), "안녕");
    expect(container.querySelector("[data-textarea-count]")).toHaveTextContent("2 / 5");
  });

  it("applies error and root styles", () => {
    const { container } = render(
      <TextArea label="소개" errorMessage="내용을 입력해 주세요." className="custom-root" />,
    );
    const textarea = screen.getByRole("textbox", { name: "소개" });
    expect(container.firstElementChild).toHaveClass("custom-root");
    expect(textarea.parentElement).toHaveClass("ring-danger");
    expect(screen.getByText("내용을 입력해 주세요.")).toBeInTheDocument();
  });

  it("fills the parent by default and applies a custom width only to the input area", () => {
    const { container, rerender } = render(<TextArea />);

    expect(container.firstElementChild).toHaveClass("w-full");

    rerender(<TextArea width={320} />);
    expect(container.firstElementChild).not.toHaveStyle({ width: "320px" });
    expect(screen.getByRole("textbox").parentElement?.parentElement).toHaveStyle({
      width: "320px",
    });

    rerender(<TextArea width={240} label="긴 레이블" errorMessage="긴 오류 문구" />);
    const inputArea = screen.getByRole("textbox").parentElement?.parentElement;
    expect(container.firstElementChild).not.toHaveStyle({ width: "240px" });
    expect(inputArea).toHaveStyle({ width: "240px" });
    expect(inputArea).not.toContainElement(screen.getByText("긴 레이블"));
    expect(inputArea).not.toContainElement(screen.getByText("긴 오류 문구"));
  });

  it("does not reserve error spacing when there is no error message", () => {
    const { container } = render(<TextArea />);
    const root = container.firstElementChild;
    const errorRoot = root?.lastElementChild;

    expect(root).not.toHaveClass("gap-1");
    expect(errorRoot).not.toHaveClass("mt-1");
  });

  it("allows only the configured character type", () => {
    render(
      <>
        <TextArea placeholder="한글" allowOnly="korean" />
        <TextArea placeholder="영어" allowOnly="english" />
        <TextArea placeholder="숫자" allowOnly="number" />
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
  });

  it("clears a validation error while typing and validates again on blur", async () => {
    const user = userEvent.setup();
    render(<ValidatedTextArea />);

    const textarea = screen.getByRole("textbox", { name: "요청 내용" });
    expect(screen.getByText("요청 내용은 10자 이상 입력해 주세요.")).toBeInTheDocument();

    await user.clear(textarea);
    await user.type(textarea, "충분히 긴 요청 내용입니다");
    await waitFor(() =>
      expect(screen.queryByText("요청 내용은 10자 이상 입력해 주세요.")).not.toBeInTheDocument(),
    );

    await user.tab();
    expect(screen.queryByText("요청 내용은 10자 이상 입력해 주세요.")).not.toBeInTheDocument();

    await user.click(textarea);
    await user.clear(textarea);
    await user.type(textarea, "짧음");
    expect(screen.queryByText("요청 내용은 10자 이상 입력해 주세요.")).not.toBeInTheDocument();

    await user.tab();
    expect(screen.getByText("요청 내용은 10자 이상 입력해 주세요.")).toBeInTheDocument();
  });

  it("handles asynchronous validation internally", async () => {
    const user = userEvent.setup();
    const getErrorMessage = vi.fn(async (value: string) =>
      value === "이미 등록된 요청" ? "이미 등록된 요청이에요." : "",
    );
    render(
      <TextArea
        placeholder="요청 내용"
        defaultValue="이미 등록된 요청"
        errorMessage={getErrorMessage}
      />,
    );

    const textarea = screen.getByPlaceholderText("요청 내용");
    await user.click(textarea);
    await user.tab();
    expect(await screen.findByText("이미 등록된 요청이에요.")).toBeInTheDocument();
    expect(getErrorMessage).toHaveBeenCalledWith("이미 등록된 요청");

    await user.click(textarea);
    await user.clear(textarea);
    await user.type(textarea, "새로운 요청");
    await waitFor(() =>
      expect(screen.queryByText("이미 등록된 요청이에요.")).not.toBeInTheDocument(),
    );
  });

  it("passes the native focus event to onBlur", async () => {
    const user = userEvent.setup();
    const handleBlur = vi.fn();
    render(<TextArea placeholder="요청 내용" onBlur={handleBlur} />);

    const textarea = screen.getByPlaceholderText("요청 내용");
    await user.click(textarea);
    await user.tab();

    expect(handleBlur).toHaveBeenCalledOnce();
    expect(handleBlur.mock.calls[0]?.[0].target).toBe(textarea);
  });

  it("places the count below the input without changing its height", () => {
    const { container } = render(<TextArea showCount maxLength={20} />);
    const textarea = screen.getByRole("textbox");
    const count = container.querySelector("[data-textarea-count]");
    expect(textarea).toHaveClass("resize-y");
    expect(textarea).not.toHaveClass("pb-7");
    expect(count).toHaveTextContent("0 / 20");
    expect(count).toHaveClass("absolute", "top-1", "right-0", "whitespace-nowrap");
  });

  it("places the absolute count beside the error message and reserves only its width", () => {
    const { container } = render(
      <TextArea
        defaultValue="입력값"
        errorMessage="길이가 긴 오류 문구도 카운트와 겹치지 않고 왼쪽 영역에서 줄바꿈돼요."
        showCount
        maxLength={20}
      />,
    );

    const errorMessage = screen.getByText(
      "길이가 긴 오류 문구도 카운트와 겹치지 않고 왼쪽 영역에서 줄바꿈돼요.",
    );
    const count = container.querySelector("[data-textarea-count]");
    const sizingCount = screen
      .getAllByText("3 / 20")
      .find((element) => element.classList.contains("invisible"));
    const footerGrid = sizingCount?.parentElement;

    expect(count).toHaveClass("absolute", "top-1", "right-0");
    expect(sizingCount).toHaveClass("invisible", "h-0");
    expect(footerGrid).toHaveClass("grid-cols-[minmax(0,1fr)_auto]", "gap-x-2");
    expect(footerGrid).toContainElement(errorMessage);
    expect(errorMessage.parentElement?.parentElement).toHaveClass("min-w-0");
  });

  it("keeps the footer flow unchanged when showCount toggles", () => {
    const { container, rerender } = render(<TextArea defaultValue="입력값" />);
    const footer = screen.getByRole("textbox").parentElement?.parentElement?.nextElementSibling;

    expect(footer).not.toHaveClass("mt-1");
    expect(footer?.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
    expect(container.querySelector("[data-textarea-count]")).not.toBeInTheDocument();

    rerender(<TextArea defaultValue="입력값" showCount />);

    expect(screen.getByRole("textbox").parentElement?.parentElement?.nextElementSibling).toBe(
      footer,
    );
    expect(footer?.querySelector("[data-textarea-count-spacer]")).toHaveClass("invisible", "h-0");
    expect(container.querySelector("[data-textarea-count]")).toHaveClass(
      "absolute",
      "top-1",
      "right-0",
    );
  });

  it("hides the resize handle when resize is false", () => {
    render(<TextArea resize={false} />);

    expect(screen.getByRole("textbox")).toHaveClass("resize-none");
  });

  it("uses the disabled token for its placeholder", () => {
    render(<TextArea placeholder="입력하세요" />);

    expect(screen.getByPlaceholderText("입력하세요")).toHaveClass("placeholder:text-disabled");
    expect(screen.getByPlaceholderText("입력하세요")).not.toHaveClass("placeholder:text-gray");
  });

  it("uses the disabled token for disabled text and the character count", () => {
    const { container } = render(<TextArea disabled defaultValue="입력값" showCount />);
    const count = container.querySelector("[data-textarea-count]");

    expect(screen.getByRole("textbox")).toHaveClass("text-disabled");
    expect(screen.getByRole("textbox")).not.toHaveClass("text-gray");
    expect(count).toHaveClass("text-disabled");
    expect(count).not.toHaveClass("text-gray");
  });

  it("uses the default cursor and does not focus by click while read only", async () => {
    const user = userEvent.setup();
    render(<TextArea readOnly defaultValue="읽기 전용" />);

    const textarea = screen.getByDisplayValue("읽기 전용");
    expect(textarea).toHaveClass("cursor-default");

    await user.click(textarea);
    expect(textarea).not.toHaveFocus();
  });

  it("applies the filled variant used by Input", () => {
    const { container } = render(<TextArea variant="filled" />);
    const root = container.querySelector("textarea")?.parentElement;
    expect(root).toHaveClass("bg-hover");
    expect(root).toHaveClass("ring-hover");
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

  it("recalculates auto size when the available width changes and releases it when disabled", () => {
    const resizeCallbacks = new Set<() => void>();
    const notifyResize = () => resizeCallbacks.forEach((callback) => callback());
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resizeCallbacks.add(callback);
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    try {
      const { rerender } = render(<TextArea autoSize defaultValue="긴 내용" />);
      const textarea = screen.getByRole("textbox");
      vi.spyOn(textarea, "getBoundingClientRect").mockReturnValue({ width: 200 } as DOMRect);
      Object.defineProperty(textarea, "scrollHeight", { configurable: true, value: 180 });
      act(notifyResize);
      expect(textarea.style.height).toBe("180px");
      Object.defineProperty(textarea, "scrollHeight", { configurable: true, value: 250 });
      act(notifyResize);
      expect(textarea.style.height).toBe("180px");
      rerender(<TextArea autoSize={false} defaultValue="긴 내용" />);
      expect(disconnect).toHaveBeenCalled();
      expect(textarea.style.height).toBe("");
      expect(textarea.style.overflowY).toBe("");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("synchronizes the animated thumb with native scrolling and removes it when content fits", () => {
    const onScroll = vi.fn();
    const { container, rerender } = render(<TextArea value="long" onScroll={onScroll} />);
    const textarea = screen.getByRole("textbox");
    Object.defineProperties(textarea, {
      clientHeight: { configurable: true, value: 118 },
      scrollHeight: { configurable: true, value: 472 },
      scrollTop: { configurable: true, writable: true, value: 177 },
    });
    fireEvent.scroll(textarea);
    const thumb = container.querySelector("[data-textarea-scrollbar-thumb]");
    expect(thumb).toHaveClass("bg-disabled", "hover:bg-disabled", "duration-200", "w-1.5");
    expect(thumb).toHaveStyle({ height: "32px", transform: "translateY(34px)" });
    expect(onScroll).toHaveBeenCalledOnce();
    Object.defineProperty(textarea, "scrollHeight", { configurable: true, value: 118 });
    rerender(<TextArea value="short" onScroll={onScroll} />);
    expect(container.querySelector("[data-textarea-scrollbar-thumb]")).toBeNull();
  });

  it.each([
    ["lg", "pl-3", "pr-1"],
    ["md", "pl-2.5", "pr-0.5"],
    ["sm", "pl-2", "pr-0"],
  ] as const)("balances the %s padding with the stable scrollbar gutter", (size, left, right) => {
    render(<TextArea size={size} />);

    expect(screen.getByRole("textbox")).toHaveClass(left, right);
  });
});
