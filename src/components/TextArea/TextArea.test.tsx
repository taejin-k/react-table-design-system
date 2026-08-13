import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TextArea } from "./TextArea";

describe("TextArea", () => {
  it("updates an uncontrolled value and displays the count", async () => {
    const user = userEvent.setup();
    render(<TextArea label="소개" maxLength={5} showCount />);

    await user.type(screen.getByRole("textbox", { name: "소개" }), "안녕");
    expect(screen.getByText("2 / 5")).toBeInTheDocument();
  });

  it("clears the value", async () => {
    const user = userEvent.setup();
    render(<TextArea label="소개" defaultValue="내용" allowClear />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("textbox", { name: "소개" })).toHaveValue("");
  });

  it("applies error and root styles", () => {
    const { container } = render(
      <TextArea label="소개" errorText="내용을 입력해 주세요." className="custom-root" />,
    );
    expect(container.firstElementChild).toHaveClass("custom-root");
    expect(screen.getByRole("textbox", { name: "소개" })).toHaveAttribute("aria-invalid", "true");
  });

  it("uses a custom count strategy", () => {
    render(
      <TextArea
        defaultValue="가 나 다"
        count={{ max: 10, strategy: (value) => value.split(" ").join("").length }}
      />,
    );
    expect(screen.getByText("3 / 10")).toBeInTheDocument();
  });

  it("keeps count controls inside the bottom edge without moving the resize corner", () => {
    render(<TextArea showCount maxLength={20} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("resize-y", "pb-7");
    expect(screen.getByText("0 / 20").parentElement).toHaveClass("absolute", "bottom-1.5");
  });
});
