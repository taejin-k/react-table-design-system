import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("selects a date from the calendar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultValue="2026-08-11" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /2026-08-11/ }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    await user.click(within(popup).getAllByRole("button", { name: "12" })[0]);

    expect(onChange).toHaveBeenCalledWith("2026-08-12", "2026-08-12");
    expect(document.querySelector("[data-datepicker-popup]")).not.toBeInTheDocument();
  });

  it("prevents disabled dates from being selected", async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue="2026-08-11" disabledDate={(date) => date.getDate() === 12} />);
    await user.click(screen.getByRole("button", { name: /2026-08-11/ }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    expect(within(popup).getByRole("button", { name: "12" })).toBeDisabled();
  });

  it("clears a selected date", async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue="2026-08-11" />);
    const clearIcon = screen.getByRole("button", { name: /2026-08-11/ }).querySelector("svg");
    expect(clearIcon).not.toBeNull();
    await user.click(clearIcon as Element);
    expect(screen.getByRole("button", { name: /날짜를 선택하세요/ })).toBeInTheDocument();
  });

  it("selects a date and time with confirmation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        defaultValue="2026-08-11 09:00"
        showTime={{ showSecond: false }}
        needConfirm
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /2026-08-11 09:00/ }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;

    expect(within(popup).queryByDisplayValue("09:00")).not.toBeInTheDocument();
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;
    expect(hourColumn).toBeInTheDocument();
    await user.click(within(hourColumn).getByRole("button", { name: "10" }));
    await user.click(within(popup).getAllByRole("button", { name: "12" })[0]);
    await user.click(within(popup).getByRole("button", { name: "확인" }));

    expect(onChange).toHaveBeenCalledWith("2026-08-12 10:00", "2026-08-12 10:00");
  });
});
