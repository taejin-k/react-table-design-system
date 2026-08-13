import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "./TimePicker";

describe("TimePicker", () => {
  it("selects time values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker defaultValue="09:00:00" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /09:00:00/ }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    const tens = within(popup).getAllByRole("button", { name: "10" });
    await user.click(tens[0]);
    expect(onChange).toHaveBeenCalledWith("10:00:00", "10:00:00");
  });

  it("waits for confirmation when requested", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker defaultValue="09:00:00" needConfirm onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /09:00:00/ }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    await user.click(within(popup).getAllByRole("button", { name: "10" })[0]);
    expect(onChange).not.toHaveBeenCalled();
    await user.click(within(popup).getByRole("button", { name: "확인" }));
    expect(onChange).toHaveBeenCalledWith("10:00:00", "10:00:00");
  });

  it("renders a 12-hour selector", async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue="13:00:00" use12Hours />);
    expect(screen.getByText("01:00:00 PM")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /01:00:00 PM/ }));
    expect(screen.getByRole("button", { name: "PM" })).toBeInTheDocument();
  });

  it("keeps the popup open while its time columns scroll", async () => {
    const user = userEvent.setup();
    render(<TimePicker />);

    await user.click(screen.getByRole("button", { name: "시간을 선택하세요" }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;

    fireEvent.scroll(hourColumn);

    expect(document.querySelector("[data-timepicker-popup]")).toBeInTheDocument();
  });

  it("disables configured hours", async () => {
    const user = userEvent.setup();
    render(<TimePicker disabledTime={() => ({ disabledHours: () => [0, 1, 2] })} />);
    await user.click(screen.getByRole("button", { name: "시간을 선택하세요" }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    expect(within(popup).getAllByRole("button", { name: "01" })[0]).toBeDisabled();
  });

  it("uses hidden scrollbars with an edge fade", async () => {
    const user = userEvent.setup();
    render(<TimePicker />);
    await user.click(screen.getByRole("button", { name: "시간을 선택하세요" }));

    const hourColumn = document.querySelector('[data-time-column="hour"]') as HTMLElement;
    expect(hourColumn).toHaveClass("wizard-scrollbar-hidden");
    expect(hourColumn.parentElement?.lastElementChild).toHaveClass("bg-gradient-to-t");
  });
});
