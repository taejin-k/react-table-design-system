import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
  it("normalizes a serialized legacy value without crashing", () => {
    render(<Calendar fullscreen={false} defaultValue={"2026-08-20" as never} />);

    expect(screen.getByRole("button", { name: "20" })).toHaveClass("bg-[#e6f4ff]");
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
    expect(compactDisabledDate).toHaveClass("text-[#bfbfbf]", "hover:bg-transparent");
    expect(compactDisabledDate.parentElement).toHaveClass("bg-[#f5f5f5]");
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
      "bg-[#e6f4ff]",
      "text-[#0062df]",
      "hover:bg-[#e6f4ff]",
    );
    expect(screen.getByRole("button", { name: "21" })).toHaveClass("hover:bg-[#f5f5f5]");
  });

  it("renders the monthly calendar without a year mode switch", () => {
    render(<Calendar defaultValue={dayjs("2026-08-20")} />);

    expect(screen.queryByRole("button", { name: "년" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "월" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "20" }).length).toBeGreaterThan(0);
  });

  it("uses the Menu hover color in the fullscreen layout", () => {
    render(<Calendar defaultValue={dayjs("2026-08-20")} />);

    expect(screen.getByRole("button", { name: "21" })).toHaveClass("hover:bg-[#f5f5f5]");
    expect(screen.getByRole("button", { name: "20" })).toHaveClass("hover:bg-[#e6f4ff]");
  });

  it("does not show a hover background on disabled fullscreen dates", () => {
    render(
      <Calendar defaultValue={dayjs("2026-08-20")} disabledDate={(date) => date.date() === 21} />,
    );

    expect(screen.getByRole("button", { name: "21" })).toHaveClass("hover:bg-transparent");
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
