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

  it("matches compact date cells to the DatePicker hover and selection style", () => {
    render(<Calendar defaultValue={new Date(2026, 7, 20)} fullscreen={false} />);

    const selectedDate = screen
      .getAllByRole("button", { name: "20" })
      .find((button) => !button.hasAttribute("disabled"));

    expect(selectedDate).toHaveClass(
      "size-8",
      "rounded",
      "bg-[#e6f4ff]",
      "text-[#0062df]",
      "hover:bg-[#e6f4ff]",
    );
    expect(screen.getByRole("button", { name: "21" })).toHaveClass("hover:bg-[#f5f5f5]");
  });

  it("renders the monthly calendar without a year mode switch", () => {
    render(<Calendar defaultValue={new Date(2026, 7, 20)} />);

    expect(screen.queryByRole("button", { name: "년" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "월" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "20" }).length).toBeGreaterThan(0);
  });
});
