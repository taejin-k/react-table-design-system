import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

function ControlledInput({ onClear }: { onClear?: () => void }) {
  const [value, setValue] = useState("검색어");
  return <Input label="검색" value={value} onChange={setValue} allowClear onClear={onClear} />;
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

  it("clears the value and restores focus to the input", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<ControlledInput onClear={onClear} />);

    await user.click(screen.getByRole("button", { name: "입력 내용 지우기" }));

    expect(screen.getByRole("textbox", { name: "검색" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "검색" })).toHaveFocus();
    expect(onClear).toHaveBeenCalledOnce();
  });
});
