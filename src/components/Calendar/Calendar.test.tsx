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

  it("fills the year cell instead of stretching a narrow selected month", () => {
    render(<Calendar defaultValue={new Date(2026, 7, 20)} mode="year" />);

    const selectedMonth = screen.getByRole("button", { name: "8월" });
    expect(selectedMonth).toHaveClass(
      "w-[calc(100%-8px)]",
      "h-[90px]",
      "bg-[#e6f4ff]",
      "text-[#0062df]",
    );
    expect(selectedMonth).not.toHaveClass("bg-[#0062df]");
  });

  it("keeps the compact year cell selected in the primary color", () => {
    render(<Calendar defaultValue={new Date(2026, 7, 20)} mode="year" fullscreen={false} />);

    expect(screen.getByRole("button", { name: "8월" })).toHaveClass(
      "w-full",
      "h-9",
      "bg-[#0062df]",
      "text-white",
    );
  });

  it("keeps both mode buttons at the same bordered size", () => {
    render(<Calendar defaultValue={new Date(2026, 7, 20)} mode="year" />);

    const monthButton = screen.getByRole("button", { name: "월" });
    const yearButton = screen.getByRole("button", { name: "년" });

    expect(monthButton).toHaveClass("h-8", "min-w-[42px]", "border");
    expect(yearButton).toHaveClass("h-8", "min-w-[42px]", "border", "border-[#0062df]");
    expect(monthButton.parentElement?.parentElement?.nextElementSibling).not.toHaveClass(
      "border-t",
    );
  });
});
