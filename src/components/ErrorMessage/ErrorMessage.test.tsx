import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("renders a message and applies className to the root", () => {
    const { container } = render(
      <ErrorMessage
        id="field-error"
        className="custom-error"
        errorMessage="입력값을 확인해 주세요."
      />,
    );

    expect(container.firstElementChild).toHaveClass("custom-error");
    expect(screen.getByText("입력값을 확인해 주세요.")).toHaveAttribute("id", "field-error");
  });
});
