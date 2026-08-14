import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Flex } from "./Flex";

describe("Flex", () => {
  it("applies direction, alignment, wrap and gap", () => {
    render(
      <Flex vertical align="center" justify="space-between" wrap gap="small" data-testid="flex">
        내용
      </Flex>,
    );
    const element = screen.getByTestId("flex");
    expect(element).toHaveClass("flex-col");
    expect(element).toHaveStyle({
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "8px",
    });
  });

  it("renders a custom component", () => {
    render(<Flex component="section">내용</Flex>);
    expect(screen.getByText("내용").tagName).toBe("SECTION");
  });
});
