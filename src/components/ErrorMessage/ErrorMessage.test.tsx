import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage", () => {
  it("renders an alert and applies className to the root", () => {
    const { container } = render(
      <ErrorMessage
        id="field-error"
        className="custom-error"
        errorMessage="입력값을 확인해 주세요."
      />,
    );

    expect(container.firstElementChild).toHaveClass("custom-error");
    expect(screen.getByRole("alert")).toHaveAttribute("id", "field-error");
    expect(screen.getByRole("alert")).toHaveTextContent("입력값을 확인해 주세요.");
  });
});
