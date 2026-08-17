import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Radio } from "./Radio";

describe("Radio", () => {
  it("selects when its label is clicked", async () => {
    const user = userEvent.setup();
    render(<Radio label="옵션" />);

    await user.click(screen.getByText("옵션"));
    expect(screen.getByRole("radio", { name: "옵션" })).toBeChecked();
  });

  it("applies className to the root label", () => {
    render(<Radio aria-label="옵션" className="custom-radio" />);

    const radio = screen.getByRole("radio", { name: "옵션" });
    expect(radio).not.toHaveClass("custom-radio");
    expect(radio.closest("label")).toHaveClass("custom-radio");
  });

  it("supports defaultChecked and blocks changes when disabled", async () => {
    const user = userEvent.setup();
    render(<Radio defaultChecked disabled label="비활성 옵션" />);

    const radio = screen.getByRole("radio", { name: "비활성 옵션" });
    expect(radio).toBeChecked();
    expect(radio).toBeDisabled();

    await user.click(screen.getByText("비활성 옵션"));
    expect(radio).toBeChecked();
  });
});
