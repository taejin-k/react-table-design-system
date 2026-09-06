import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Radio } from "./Radio";

describe("Radio", () => {
  it("selects when its label is clicked", async () => {
    const user = userEvent.setup();
    render(<Radio label="옵션" />);

    await user.click(screen.getByText("옵션"));
    const radio = screen.getByRole("radio", { name: "옵션" });
    expect(radio).toBeChecked();
    expect(radio).toHaveClass(
      "transition-[background-color,border-color,box-shadow]",
      "duration-200",
      "ease-out",
      "motion-reduce:transition-none",
    );
    expect(screen.getByText("옵션")).toHaveClass("transition-colors", "duration-200");
  });

  it("applies className to the root label", () => {
    render(<Radio className="custom-radio" />);

    const radio = screen.getByRole("radio");
    expect(radio).not.toHaveClass("custom-radio");
    expect(radio.closest("label")).toHaveClass("custom-radio");
  });

  it("uses the danger color when an error radio is selected", () => {
    render(<Radio defaultChecked error />);

    const radio = screen.getByRole("radio");
    expect(radio).toHaveClass("checked:border-danger", "checked:bg-danger");
    expect(radio).not.toHaveClass("checked:border-primary", "checked:bg-primary");
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

  it("preserves newlines in its label", () => {
    render(<Radio label={"첫 줄\n둘째 줄"} />);

    expect(screen.getByText(/첫 줄\s+둘째 줄/)).toHaveClass("whitespace-pre-line");
  });

  it("wraps continuous English letters and numbers in its label", () => {
    render(<Radio label="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" />);

    const labelText = screen.getByText("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
    expect(labelText).toHaveClass("min-w-0", "break-all");
    expect(labelText.closest("label")).toHaveClass("max-w-full", "min-w-0");
  });
});
