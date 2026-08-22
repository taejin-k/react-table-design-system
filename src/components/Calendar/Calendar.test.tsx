import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
  it("selects a date and reports the source", async () => {
    const onSelect = vi.fn();
    render(
      <Calendar fullscreen={false} defaultValue={new Date(2026, 7, 20)} onSelect={onSelect} />,
    );
    await userEvent.click(
      screen
        .getAllByRole("button", { name: "21" })
        .find((button) => !button.hasAttribute("disabled"))!,
    );
    expect(onSelect).toHaveBeenCalledWith(expect.any(Date), { source: "date" });
  });

  it("disables dates through disabledDate", () => {
    render(
      <Calendar
        fullscreen={false}
        defaultValue={new Date(2026, 7, 20)}
        disabledDate={(date) => date.getDate() === 21}
      />,
    );
    expect(
      screen
        .getAllByRole("button", { name: "21" })
        .every((button) => button.hasAttribute("disabled")),
    ).toBe(true);
  });
});
