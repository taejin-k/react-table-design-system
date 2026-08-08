import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorText } from "./ErrorText";

describe("ErrorText", () => {
  it("renders an alert and applies className to the root", () => {
    const { container } = render(
      <ErrorText id="field-error" className="custom-error">
        입력값을 확인해 주세요.
      </ErrorText>,
    );

    expect(container.firstElementChild).toHaveClass("custom-error");
    expect(screen.getByRole("alert")).toHaveAttribute("id", "field-error");
    expect(screen.getByRole("alert")).toHaveTextContent("입력값을 확인해 주세요.");
  });
});
