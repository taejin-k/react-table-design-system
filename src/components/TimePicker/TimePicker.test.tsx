import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "./TimePicker";

describe("TimePicker", () => {
  it("normalizes serialized legacy values without crashing", () => {
    render(<TimePicker multiple defaultValue={["09:00:00", "13:30:00"] as never} />);

    expect(document.querySelectorAll("[data-timepicker-tag]")).toHaveLength(2);
    expect(screen.getByText("09:00:00")).toBeInTheDocument();
    expect(screen.getByText("13:30:00")).toBeInTheDocument();
  });

  it("orders initial multiple values when order is enabled", () => {
    render(
      <TimePicker
        multiple
        defaultValue={[dayjs("2026-08-20 13:30:00"), dayjs("2026-08-20 09:00:00")]}
      />,
    );

    expect(
      Array.from(document.querySelectorAll("[data-timepicker-tag]"), (tag) => tag.textContent),
    ).toEqual(["09:00:00", "13:30:00"]);
  });

  it("uses format for the displayed value and change string", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker
        defaultValue={dayjs("2026-08-20 09:25:30")}
        format="HH시 mm분"
        onChange={onChange}
      />,
    );

    expect(screen.getByText("09시 25분")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /09시 25분/ }));
    expect(document.querySelector('[data-time-column="second"]')).not.toBeInTheDocument();
    const hourColumn = document.querySelector('[data-time-column="hour"]') as HTMLElement;
    await user.click(within(hourColumn).getByRole("button", { name: "10" }));
    expect(onChange.mock.calls[0]?.[1]).toBe("10시 25분");
  });

  it("uses the first 24-hour option as the initial time", async () => {
    const user = userEvent.setup();
    render(<TimePicker />);

    await user.click(screen.getByRole("button", { name: "시간을 선택하세요" }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;

    expect(within(hourColumn).getByRole("button", { name: "00" })).toHaveClass("bg-selected");
  });

  it("uses 01 AM as the initial 12-hour option", async () => {
    const user = userEvent.setup();
    render(<TimePicker use12Hours />);

    await user.click(screen.getByRole("button", { name: "시간을 선택하세요" }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;

    expect(within(hourColumn).getByRole("button", { name: "01" })).toHaveClass("bg-selected");
    expect(within(popup).getByRole("button", { name: "AM" })).toHaveClass("bg-selected");
  });

  it("resets the open time panel when the value is cleared", async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={dayjs("2026-08-20 10:25:10")} />);

    const trigger = screen.getByRole("button", { name: /10:25:10/ });
    await user.click(trigger);
    await user.click(trigger.querySelector("svg") as Element);

    const hourColumn = document.querySelector('[data-time-column="hour"]') as HTMLElement;
    const minuteColumn = document.querySelector('[data-time-column="minute"]') as HTMLElement;
    const secondColumn = document.querySelector('[data-time-column="second"]') as HTMLElement;
    expect(within(hourColumn).getByRole("button", { name: "00" })).toHaveClass("bg-selected");
    expect(within(minuteColumn).getByRole("button", { name: "00" })).toHaveClass("bg-selected");
    expect(within(secondColumn).getByRole("button", { name: "00" })).toHaveClass("bg-selected");
    expect(screen.getByRole("button", { name: "시간을 선택하세요" })).toBeInTheDocument();
  });

  it("resets to the first available time when the initial time is disabled", async () => {
    const user = userEvent.setup();
    render(
      <TimePicker
        defaultValue={dayjs("2026-08-20 10:25:10")}
        disabledTime={() => ({ disabledHours: () => [0, 1, 2] })}
      />,
    );

    const trigger = screen.getByRole("button", { name: /10:25:10/ });
    await user.click(trigger);
    await user.click(trigger.querySelector("svg") as Element);

    const hourColumn = document.querySelector('[data-time-column="hour"]') as HTMLElement;
    expect(within(hourColumn).getByRole("button", { name: "03" })).toHaveClass("bg-selected");
  });

  it("selects time values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker defaultValue={dayjs("2026-08-20 09:00:00")} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /09:00:00/ }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    const tens = within(popup).getAllByRole("button", { name: "10" });
    await user.click(tens[0]);
    expect(onChange.mock.calls[0]?.[0].format("HH:mm:ss")).toBe("10:00:00");
    expect(onChange.mock.calls[0]?.[1]).toBe("10:00:00");
  });

  it("adds and orders multiple time values after confirmation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker
        multiple
        defaultValue={[dayjs("2026-08-20 13:30:00"), dayjs("2026-08-20 09:00:00")]}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: /09:00:00/ });
    expect(document.querySelectorAll("[data-timepicker-tag]")).toHaveLength(2);
    await user.click(trigger);

    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;
    await user.click(within(hourColumn).getByRole("button", { name: "10" }));
    expect(onChange).not.toHaveBeenCalled();

    await user.click(within(popup).getByRole("button", { name: "확인" }));
    const values = onChange.mock.calls[0]?.[0];
    expect(values.map((item: dayjs.Dayjs) => item.format("HH:mm:ss"))).toEqual([
      "09:00:00",
      "10:00:00",
      "13:30:00",
    ]);
    expect(onChange.mock.calls[0]?.[1]).toEqual(["09:00:00", "10:00:00", "13:30:00"]);
  });

  it("removes one multiple time from its tag", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker
        multiple
        defaultValue={[dayjs("2026-08-20 09:00:00"), dayjs("2026-08-20 13:30:00")]}
        onChange={onChange}
      />,
    );

    const firstTag = document.querySelector("[data-timepicker-tag]") as HTMLElement;
    await user.click(firstTag.querySelector("svg") as Element);

    expect(onChange.mock.calls[0]?.[0]).toHaveLength(1);
    expect(onChange.mock.calls[0]?.[0][0].format("HH:mm:ss")).toBe("13:30:00");
    expect(onChange.mock.calls[0]?.[1]).toEqual(["13:30:00"]);
    expect(document.querySelectorAll("[data-timepicker-tag]")).toHaveLength(1);
  });

  it("uses the same hover and active colors as Select", async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={dayjs("2026-08-20 09:00:00")} />);

    await user.click(screen.getByRole("button", { name: /09:00:00/ }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;
    const selectedHour = within(hourColumn).getByRole("button", { name: "09" });
    const unselectedHour = within(hourColumn).getByRole("button", { name: "10" });

    expect(selectedHour).toHaveClass("bg-selected", "text-primary", "hover:bg-selected");
    expect(unselectedHour).toHaveClass("hover:bg-[#f5f5f5]");
  });

  it("keeps the filled background and focus style while read only", async () => {
    const user = userEvent.setup();
    render(<TimePicker variant="filled" readOnly defaultValue={dayjs("2026-08-20 08:30:00")} />);

    const trigger = screen.getByRole("button", { name: /08:30:00/ });
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveClass(
      "border-[#f5f5f5]",
      "bg-[#f5f5f5]",
      "focus:border-primary",
      "focus:outline-none",
    );

    await user.click(trigger);
    expect(trigger).toHaveFocus();
    expect(document.querySelector("[data-timepicker-popup]")).not.toBeInTheDocument();
  });

  it("waits for confirmation when requested", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker defaultValue={dayjs("2026-08-20 09:00:00")} needConfirm onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: /09:00:00/ }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    await user.click(within(popup).getAllByRole("button", { name: "10" })[0]);
    expect(onChange).not.toHaveBeenCalled();
    await user.click(within(popup).getByRole("button", { name: "확인" }));
    expect(onChange.mock.calls[0]?.[0].format("HH:mm:ss")).toBe("10:00:00");
    expect(onChange.mock.calls[0]?.[1]).toBe("10:00:00");
  });

  it("renders a 12-hour selector", async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={dayjs("2026-08-20 13:00:00")} use12Hours />);
    expect(screen.getByText("01:00:00 PM")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /01:00:00 PM/ }));
    const popup = document.querySelector("[data-timepicker-popup]") as HTMLElement;
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;
    expect(within(hourColumn).getByRole("button", { name: "12" })).toBeInTheDocument();
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

  it("does not allow the current-time shortcut when that time is disabled", async () => {
    const user = userEvent.setup();
    const currentHour = new Date().getHours();
    render(<TimePicker disabledTime={() => ({ disabledHours: () => [currentHour] })} />);

    await user.click(screen.getByRole("button", { name: "시간을 선택하세요" }));

    expect(screen.getByRole("button", { name: "지금" })).toBeDisabled();
  });

  it("disables a meridiem option when its matching hour is disabled", async () => {
    const user = userEvent.setup();
    render(
      <TimePicker
        use12Hours
        defaultValue={dayjs("2026-08-20 01:00:00")}
        disabledTime={() => ({ disabledHours: () => [13] })}
      />,
    );

    await user.click(screen.getByRole("button", { name: /01:00:00 AM/ }));

    expect(screen.getByRole("button", { name: "PM" })).toBeDisabled();
  });

  it("hides disabled values with hideDisabled", async () => {
    const user = userEvent.setup();
    render(<TimePicker hideDisabled disabledTime={() => ({ disabledHours: () => [0, 1, 2] })} />);

    await user.click(screen.getByRole("button", { name: "시간을 선택하세요" }));
    const hourColumn = document.querySelector('[data-time-column="hour"]') as HTMLElement;

    expect(within(hourColumn).queryByRole("button", { name: "00" })).not.toBeInTheDocument();
    expect(within(hourColumn).queryByRole("button", { name: "01" })).not.toBeInTheDocument();
    expect(within(hourColumn).queryByRole("button", { name: "02" })).not.toBeInTheDocument();
    expect(within(hourColumn).getByRole("button", { name: "03" })).toBeInTheDocument();
  });

  it("uses hidden scrollbars with an edge fade", async () => {
    const user = userEvent.setup();
    render(<TimePicker />);
    await user.click(screen.getByRole("button", { name: "시간을 선택하세요" }));

    const hourColumn = document.querySelector('[data-time-column="hour"]') as HTMLElement;
    expect(hourColumn).toHaveClass("wizard-scrollbar-hidden");
    expect(hourColumn.parentElement?.lastElementChild).toHaveClass("bg-gradient-to-t");
  });

  it("opens each column at its selected time", async () => {
    const user = userEvent.setup();
    render(<TimePicker defaultValue={dayjs("2026-08-20 10:25:10")} />);

    const trigger = screen.getByRole("button", { name: /10:25:10/ });
    await user.click(trigger);

    const hourColumn = document.querySelector<HTMLElement>('[data-time-column="hour"]');
    expect(hourColumn?.scrollTop).toBe(360);
    expect(document.querySelector<HTMLElement>('[data-time-column="minute"]')?.scrollTop).toBe(900);
    expect(document.querySelector<HTMLElement>('[data-time-column="second"]')?.scrollTop).toBe(360);

    await user.click(within(hourColumn as HTMLElement).getByRole("button", { name: "11" }));
    expect(hourColumn?.scrollTop).toBe(360);

    await user.click(trigger);
    await waitFor(() => expect(document.querySelector("[data-timepicker-popup]")).toBeNull());
    await user.click(trigger);

    expect(document.querySelector<HTMLElement>('[data-time-column="hour"]')?.scrollTop).toBe(396);
  });
});
