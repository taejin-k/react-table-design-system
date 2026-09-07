import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
  it("normalizes a serialized legacy value without crashing", () => {
    render(<Calendar fullscreen={false} defaultValue={"2026-08-20" as never} />);

    expect(screen.getByRole("button", { name: "20" })).toHaveClass("bg-selected");
  });

  it("selects a date", async () => {
    const onSelect = vi.fn();
    render(<Calendar fullscreen={false} defaultValue={dayjs("2026-08-20")} onSelect={onSelect} />);
    await userEvent.click(
      screen
        .getAllByRole("button", { name: "21" })
        .find((button) => !button.hasAttribute("disabled"))!,
    );
    expect(onSelect.mock.calls[0]?.[0].format("YYYY-MM-DD")).toBe("2026-08-21");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("disables dates through disabledDate", () => {
    render(
      <Calendar
        fullscreen={false}
        defaultValue={dayjs("2026-08-20")}
        disabledDate={(date) => date.date() === 21}
      />,
    );
    const compactDisabledDate = screen
      .getAllByRole("button", { name: "21" })
      .find((button) => button.hasAttribute("disabled"))!;
    expect(compactDisabledDate).toHaveClass("text-border", "hover:bg-transparent");
    expect(compactDisabledDate.parentElement).toHaveClass("bg-hover");
  });

  it("passes Dayjs values to a custom header", async () => {
    const onPanelChange = vi.fn();
    render(
      <Calendar
        defaultValue={dayjs("2026-08-20")}
        onPanelChange={onPanelChange}
        headerRender={({ value, onChange }) => (
          <button type="button" onClick={() => onChange(dayjs("2026-09-20"))}>
            {value.format("YYYY-MM-DD")}
          </button>
        )}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "2026-08-20" }));

    expect(onPanelChange.mock.calls[0]?.[0].format("YYYY-MM-DD")).toBe("2026-09-20");
    expect(screen.getByRole("button", { name: "2026-09-20" })).toBeInTheDocument();
  });

  it("matches compact date cells to the DatePicker hover and selection style", () => {
    render(<Calendar defaultValue={dayjs("2026-08-20")} fullscreen={false} />);

    const selectedDate = screen
      .getAllByRole("button", { name: "20" })
      .find((button) => !button.hasAttribute("disabled"));

    expect(selectedDate).toHaveClass(
      "size-8",
      "rounded",
      "bg-selected",
      "text-primary",
      "hover:bg-selected",
    );
    expect(screen.getByRole("button", { name: "21" })).toHaveClass("hover:bg-hover");
  });

  it("renders the monthly calendar without a year mode switch", () => {
    render(<Calendar defaultValue={dayjs("2026-08-20")} />);

    expect(screen.queryByRole("button", { name: "년" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "월" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "20" }).length).toBeGreaterThan(0);
  });

  it("uses the Menu hover color in the fullscreen layout", () => {
    render(<Calendar defaultValue={dayjs("2026-08-20")} />);

    expect(screen.getByRole("button", { name: "21" })).toHaveClass("hover:bg-hover");
    expect(screen.getByRole("button", { name: "20" })).toHaveClass("hover:bg-selected");
  });

  it("does not show a hover background on disabled fullscreen dates", () => {
    render(
      <Calendar defaultValue={dayjs("2026-08-20")} disabledDate={(date) => date.date() === 21} />,
    );

    expect(screen.getByRole("button", { name: "21" })).toHaveClass(
      "disabled:text-border",
      "hover:bg-transparent",
    );
  });

  it("selects a date when custom cell text is clicked but preserves text dragging", async () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        defaultValue={dayjs("2026-08-20")}
        onSelect={onSelect}
        cellRender={(date) =>
          date.format("YYYY-MM-DD") === "2026-08-21" ? <span>선택 가능한 일정</span> : null
        }
      />,
    );

    const text = screen.getByText("선택 가능한 일정");
    await userEvent.click(text);
    expect(onSelect.mock.calls[0]?.[0].format("YYYY-MM-DD")).toBe("2026-08-21");

    onSelect.mockClear();
    fireEvent.pointerDown(text, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(text, { clientX: 30, clientY: 10 });
    fireEvent.click(text);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("splits range events across weeks and reports event clicks", async () => {
    const rangeEvent = {
      key: "release",
      title: "릴리스 기간",
      start: dayjs("2026-08-07"),
      end: dayjs("2026-08-10"),
      color: "#1677ff",
    };
    const onEventClick = vi.fn();
    render(
      <Calendar
        defaultValue={dayjs("2026-08-01")}
        events={[rangeEvent]}
        onEventClick={onEventClick}
      />,
    );

    const segments = screen.getAllByText("릴리스 기간");
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveStyle({ backgroundColor: "#1677ff" });
    expect(segments[0]).toHaveClass("rounded-l-full");
    expect(segments[0]).not.toHaveClass("rounded-r-full");
    expect(segments[1]).not.toHaveClass("rounded-l-full");
    expect(segments[1]).toHaveClass("rounded-r-full");
    expect(segments[0]).toHaveStyle({
      left: "calc(71.42857142857143% + 8px)",
      width: "calc(28.571428571428573% - 16px)",
    });
    expect(segments[1]).toHaveStyle({
      left: "calc(0% + 8px)",
      width: "calc(28.571428571428573% - 16px)",
    });
    expect(segments[0]).toHaveClass("transition-opacity", "duration-200", "hover:opacity-75");

    const firstWeek = segments[0]!.parentElement!;
    vi.spyOn(firstWeek, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 700,
      top: 0,
      right: 700,
      bottom: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.pointerMove(segments[0]!, { clientX: 650 });
    expect(firstWeek.querySelectorAll("[data-calendar-cell]")[6]?.firstElementChild).toHaveClass(
      "bg-hover",
    );
    fireEvent.pointerLeave(segments[0]!);
    expect(
      firstWeek.querySelectorAll("[data-calendar-cell]")[6]?.firstElementChild,
    ).not.toHaveClass("bg-hover");

    await userEvent.click(segments[0]!);
    expect(onEventClick).toHaveBeenCalledWith(rangeEvent);
  });

  it("places overlapping range events on separate lanes", () => {
    const { container } = render(
      <Calendar
        defaultValue={dayjs("2026-08-01")}
        events={[
          {
            key: "first",
            title: "첫 번째",
            start: dayjs("2026-08-04"),
            end: dayjs("2026-08-07"),
          },
          {
            key: "second",
            title: "두 번째",
            start: dayjs("2026-08-05"),
            end: dayjs("2026-08-06"),
          },
        ]}
      />,
    );

    expect(container.querySelector('[data-calendar-event-key="first"]')).toHaveStyle({
      top: "32px",
    });
    expect(container.querySelector('[data-calendar-event-key="second"]')).toHaveStyle({
      top: "52px",
    });
  });
});
