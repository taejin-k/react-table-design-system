import { render, screen, waitFor, within } from "@testing-library/react";
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
    await waitFor(() =>
      expect(document.querySelector("[data-datepicker-popup]")).not.toBeInTheDocument(),
    );
  });

  it("prevents disabled dates from being selected", async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue="2026-08-11" disabledDate={(date) => date.getDate() === 12} />);
    await user.click(screen.getByRole("button", { name: /2026-08-11/ }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    expect(within(popup).getByRole("button", { name: "12" })).toBeDisabled();
  });

  it("moves the date panel by one year with the outer header buttons", async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue="2026-08-11" />);

    await user.click(screen.getByRole("button", { name: /2026-08-11/ }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    const previousYear = popup.querySelector("[data-datepicker-previous-year]") as HTMLElement;
    const nextYear = popup.querySelector("[data-datepicker-next-year]") as HTMLElement;

    await user.click(nextYear);
    expect(within(popup).getByText("2027년 8월")).toBeInTheDocument();
    await user.click(previousYear);
    expect(within(popup).getByText("2026년 8월")).toBeInTheDocument();
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
    expect(popup).toHaveStyle({ width: "420px" });
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;
    expect(hourColumn).toBeInTheDocument();
    expect(popup.querySelector('[data-time-column="second"]')).not.toBeInTheDocument();
    await user.click(within(hourColumn).getByRole("button", { name: "10" }));
    await user.click(within(popup).getAllByRole("button", { name: "12" })[0]);
    await user.click(within(popup).getByRole("button", { name: "확인" }));

    expect(onChange).toHaveBeenCalledWith("2026-08-12 10:00", "2026-08-12 10:00");
  });

  it("adds popup width only for rendered time columns", async () => {
    const user = userEvent.setup();
    render(<DatePicker showTime />);

    await user.click(screen.getByRole("button", { name: "날짜를 선택하세요" }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;

    expect(popup).toHaveStyle({ width: "476px" });
    expect(popup.querySelector('[data-time-column="second"]')).toBeInTheDocument();
  });

  it("does not select today when it is outside the allowed range", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    render(<DatePicker minDate={minDate} showNow onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "날짜를 선택하세요" }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    await user.click(within(popup).getByRole("button", { name: "오늘" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(document.querySelector("[data-datepicker-popup]")).toBeInTheDocument();
  });

  it("renders two adjacent calendar panels for a range", async () => {
    const user = userEvent.setup();
    render(<DatePicker.RangePicker defaultPickerValue="2026-08-01" />);

    await user.click(screen.getByRole("button", { name: /시작 날짜.*종료 날짜/ }));
    const popup = document.querySelector("[data-datepicker-range-popup]") as HTMLElement;

    expect(within(popup).getByText("2026년 8월")).toBeInTheDocument();
    expect(within(popup).getByText("2026년 9월")).toBeInTheDocument();
  });

  it("removes one multiple value from its chip close icon", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker multiple defaultValue={["2026-08-11", "2026-08-14"]} onChange={onChange} />);

    const tags = document.querySelectorAll("[data-datepicker-tag]");
    tags.forEach((tag) => expect(tag).toHaveClass("tabular-nums"));
    expect(tags[0]).toHaveAttribute("data-datepicker-layout-key", "tag:2026-08-11");

    const firstTag = tags[0];
    await user.click(firstTag.querySelector("svg")!);

    expect(onChange).toHaveBeenCalledWith(["2026-08-14"], ["2026-08-14"]);
    await waitFor(() => expect(screen.queryByText("2026-08-11")).not.toBeInTheDocument());
  });
});
