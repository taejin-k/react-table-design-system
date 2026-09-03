import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("normalizes serialized legacy values without crashing", () => {
    render(<DatePicker multiple defaultValue={["2026-08-11", "2026-08-14"] as never} />);

    expect(document.querySelectorAll("[data-datepicker-tag]")).toHaveLength(2);
    expect(screen.getByText("2026-08-11")).toBeInTheDocument();
    expect(screen.getByText("2026-08-14")).toBeInTheDocument();
  });

  it("orders initial multiple values when order is enabled", () => {
    render(<DatePicker multiple defaultValue={[dayjs("2026-08-14"), dayjs("2026-08-11")]} />);

    expect(
      Array.from(document.querySelectorAll("[data-datepicker-tag]"), (tag) => tag.textContent),
    ).toEqual(["2026-08-11", "2026-08-14"]);
  });

  it("formats both date and time tokens", () => {
    render(
      <DatePicker
        defaultValue={dayjs("2026-08-11 09:25:30")}
        showTime
        format="YYYY년 MM월 DD일 HH:mm:ss"
      />,
    );

    expect(screen.getByText("2026년 08월 11일 09:25:30")).toBeInTheDocument();
  });

  it("selects a date from the calendar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker defaultValue={dayjs("2026-08-11")} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /2026-08-11/ }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    await user.click(within(popup).getAllByRole("button", { name: "12" })[0]);

    expect(onChange.mock.calls[0]?.[0].format("YYYY-MM-DD")).toBe("2026-08-12");
    await waitFor(() =>
      expect(document.querySelector("[data-datepicker-popup]")).not.toBeInTheDocument(),
    );
  });

  it("prevents disabled dates from being selected", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker defaultValue={dayjs("2026-08-11")} disabledDate={(date) => date.date() === 12} />,
    );
    await user.click(screen.getByRole("button", { name: /2026-08-11/ }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    expect(within(popup).getByRole("button", { name: "12" })).toBeDisabled();
  });

  it("connects adjacent disabled date backgrounds and keeps their text readable", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue={dayjs("2026-08-11")}
        disabledDate={(date) => date.date() === 12 || date.date() === 13}
      />,
    );

    await user.click(screen.getByRole("button", { name: /2026-08-11/ }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    const date12 = within(popup).getByRole("button", { name: "12" });
    const date13 = within(popup).getByRole("button", { name: "13" });

    expect(date12).toHaveClass("bg-transparent", "text-disabled");
    expect(date12.parentElement).toHaveClass("bg-hover");
    expect(date13.parentElement).toHaveClass("bg-hover");
    expect(date12.parentElement?.parentElement).toHaveClass("contents");
    expect(date12.parentElement?.parentElement?.nextElementSibling?.firstElementChild).toBe(
      date13.parentElement,
    );
  });

  it("keeps adjacent-month dates muted over custom cell colors", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultPickerValue={dayjs("2026-08-01")}
        cellRender={(_, origin) => <span className="text-danger">{origin}</span>}
      />,
    );

    await user.click(screen.getByRole("button", { name: "날짜를 선택하세요" }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    const adjacentJuly26 = within(popup).getAllByRole("button", { name: "26" })[0];

    expect(adjacentJuly26).toHaveClass("text-disabled", "[&_*]:text-disabled!");
    expect(adjacentJuly26.firstElementChild).toHaveClass("text-danger");
  });

  it("keeps the trigger focusable without opening while read only", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker readOnly defaultValue={dayjs("2026-08-11")} onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: /2026-08-11/ });
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveClass("focus:border-primary", "focus:outline-none");

    await user.click(trigger);

    expect(trigger).toHaveFocus();
    expect(document.querySelector("[data-datepicker-popup]")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the filled background while read only", () => {
    render(<DatePicker variant="filled" readOnly defaultValue={dayjs("2026-08-11")} />);

    expect(screen.getByRole("button", { name: /2026-08-11/ })).toHaveClass(
      "border-hover",
      "bg-hover",
    );
  });

  it("uses the disabled text color for a selected value", () => {
    render(<DatePicker disabled defaultValue={dayjs("2026-08-11")} />);

    expect(screen.getByText("2026-08-11").parentElement).toHaveClass("text-gray");
  });

  it("moves the date panel by one year with the outer header buttons", async () => {
    const user = userEvent.setup();
    render(<DatePicker defaultValue={dayjs("2026-08-11")} />);

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
    render(<DatePicker defaultValue={dayjs("2026-08-11")} />);
    const clearIcon = screen.getByRole("button", { name: /2026-08-11/ }).querySelector("svg");
    expect(clearIcon).not.toBeNull();
    await user.click(clearIcon as Element);
    expect(screen.getByRole("button", { name: /날짜를 선택하세요/ })).toBeInTheDocument();
  });

  it("resets the open date panel when the value is cleared", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker defaultValue={dayjs("2026-08-11")} defaultPickerValue={dayjs("2026-08-01")} />,
    );

    const trigger = screen.getByRole("button", { name: /2026-08-11/ });
    await user.click(trigger);
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    const headerButtons = within(popup).getAllByRole("button").slice(0, 4);
    await user.click(headerButtons[2]);
    expect(within(popup).getByText("2026년 9월")).toBeInTheDocument();

    await user.click(trigger.querySelector("svg") as Element);

    expect(within(popup).getByText("2026년 8월")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /날짜를 선택하세요/ })).toBeInTheDocument();
  });

  it("clears the selected time with the date", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue={dayjs("2026-08-11 10:25:10")}
        showTime={{ disabledTime: () => ({ disabledHours: () => [0, 1, 2] }) }}
      />,
    );

    const trigger = screen.getByRole("button", { name: /2026-08-11 10:25:10/ });
    const clearIcon = trigger.querySelector("svg");
    await user.click(clearIcon as Element);
    await user.click(screen.getByRole("button", { name: "날짜를 선택하세요" }));

    const hourColumn = document.querySelector('[data-time-column="hour"]') as HTMLElement;
    const minuteColumn = document.querySelector('[data-time-column="minute"]') as HTMLElement;
    const secondColumn = document.querySelector('[data-time-column="second"]') as HTMLElement;
    expect(within(hourColumn).getByRole("button", { name: "03" })).toHaveClass("bg-selected");
    expect(within(minuteColumn).getByRole("button", { name: "00" })).toHaveClass("bg-selected");
    expect(within(secondColumn).getByRole("button", { name: "00" })).toHaveClass("bg-selected");
  });

  it("selects a date and time with confirmation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        defaultValue={dayjs("2026-08-11 09:00")}
        showTime={{ showSecond: false }}
        needConfirm
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: /2026-08-11 09:00/ }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;

    expect(within(popup).queryByDisplayValue("09:00")).not.toBeInTheDocument();
    expect(popup).toHaveStyle({ width: "404px" });
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;
    expect(hourColumn).toBeInTheDocument();
    expect(popup.querySelector('[data-time-column="second"]')).not.toBeInTheDocument();
    await user.click(within(hourColumn).getByRole("button", { name: "10" }));
    await user.click(within(popup).getAllByRole("button", { name: "12" })[0]);
    await user.click(within(popup).getByRole("button", { name: "확인" }));

    expect(onChange.mock.calls[0]?.[0].format("YYYY-MM-DD HH:mm")).toBe("2026-08-12 10:00");
  });

  it("adds popup width only for rendered time columns", async () => {
    const user = userEvent.setup();
    render(<DatePicker showTime />);

    await user.click(screen.getByRole("button", { name: "날짜를 선택하세요" }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;

    expect(popup).toHaveStyle({ width: "460px" });
    expect(popup.querySelector('[data-time-column="second"]')).toBeInTheDocument();
  });

  it.each([
    {
      picker: "date" as const,
      placeholder: "날짜를 선택하세요",
      selectedLabel: String(new Date().getDate()),
    },
    {
      picker: "month" as const,
      placeholder: "월을 선택하세요",
      selectedLabel: `${new Date().getMonth() + 1}월`,
    },
    {
      picker: "year" as const,
      placeholder: "연도를 선택하세요",
      selectedLabel: String(new Date().getFullYear()),
    },
  ])(
    "uses today as the initial $picker selection",
    async ({ picker, placeholder, selectedLabel }) => {
      const user = userEvent.setup();
      render(<DatePicker picker={picker} />);

      await user.click(screen.getByRole("button", { name: placeholder }));
      const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
      const selectedButton = within(popup)
        .getAllByRole("button", { name: selectedLabel })
        .find((button) => button.classList.contains("bg-selected"));

      expect(selectedButton).toBeDefined();
    },
  );

  it("uses 01:00:00 AM as the initial 12-hour value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const today = new Date();
    const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    render(
      <DatePicker
        showTime={{ use12Hours: true, showSecond: true }}
        needConfirm
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "날짜를 선택하세요" }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    const hourColumn = popup.querySelector('[data-time-column="hour"]') as HTMLElement;
    const minuteColumn = popup.querySelector('[data-time-column="minute"]') as HTMLElement;
    const secondColumn = popup.querySelector('[data-time-column="second"]') as HTMLElement;

    expect(within(hourColumn).getByRole("button", { name: "01" })).toHaveClass("bg-selected");
    expect(within(minuteColumn).getByRole("button", { name: "00" })).toHaveClass("bg-selected");
    expect(within(secondColumn).getByRole("button", { name: "00" })).toHaveClass("bg-selected");
    expect(within(popup).getByRole("button", { name: "AM" })).toHaveClass("bg-selected");

    await user.click(within(popup).getByRole("button", { name: "확인" }));
    expect(onChange.mock.calls[0]?.[0].format("YYYY-MM-DD HH:mm:ss")).toBe(
      `${todayValue} 01:00:00`,
    );
  });

  it("does not select today when it is outside the allowed range", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = dayjs(tomorrow);

    render(<DatePicker minDate={minDate} showNow onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "날짜를 선택하세요" }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    await user.click(within(popup).getByRole("button", { name: "오늘" }));

    expect(onChange).not.toHaveBeenCalled();
    expect(document.querySelector("[data-datepicker-popup]")).toBeInTheDocument();
  });

  it("hides the today button when the preset dropdown is available", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        showNow
        presets={[
          { label: "오늘", value: dayjs("2026-08-11") },
          { label: "프로젝트 시작일", value: dayjs("2026-08-17") },
        ]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "날짜를 선택하세요" }));
    const popup = document.querySelector("[data-datepicker-popup]") as HTMLElement;
    const presetTrigger = within(popup).getByRole("button", { name: "빠른 선택" });

    expect(within(popup).queryByRole("button", { name: "오늘" })).not.toBeInTheDocument();
    expect(presetTrigger).toBeInTheDocument();
    await user.click(presetTrigger);
    await user.click(screen.getByRole("button", { name: "프로젝트 시작일" }));

    expect(onChange.mock.calls[0]?.[0].format("YYYY-MM-DD")).toBe("2026-08-17");
  });

  it("waits for confirmation after selecting a preset when confirmation is required", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DatePicker
        needConfirm
        presets={[{ label: "프로젝트 시작일", value: dayjs("2026-08-17") }]}
        onChange={onChange}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "날짜를 선택하세요" }));
    await user.click(screen.getByRole("button", { name: "빠른 선택" }));
    await user.click(screen.getByRole("button", { name: "프로젝트 시작일" }));

    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "확인" }));
    expect(onChange.mock.calls[0]?.[0].format("YYYY-MM-DD")).toBe("2026-08-17");
    expect(onConfirm.mock.calls[0]?.[0].format("YYYY-MM-DD")).toBe("2026-08-17");
  });

  it("renders two adjacent calendar panels for a range", async () => {
    const user = userEvent.setup();
    render(<DatePicker.RangePicker defaultPickerValue={dayjs("2026-08-01")} />);
    expect(document.querySelector("[data-datepicker-range-separator] svg")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /시작 날짜.*종료 날짜/ }));
    const popup = document.querySelector("[data-datepicker-range-popup]") as HTMLElement;

    expect(within(popup).getByText("2026년 8월")).toBeInTheDocument();
    expect(within(popup).getByText("2026년 9월")).toBeInTheDocument();
    expect(popup.firstElementChild).not.toHaveClass("divide-x");
  });

  it("resets both open range panels when the value is cleared", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker.RangePicker
        defaultValue={[dayjs("2026-08-11"), dayjs("2026-08-14")]}
        defaultPickerValue={dayjs("2026-08-01")}
      />,
    );

    const trigger = screen.getByRole("button", { name: /2026-08-11.*2026-08-14/ });
    await user.click(trigger);
    const popup = document.querySelector("[data-datepicker-range-popup]") as HTMLElement;
    const rightPanel = popup.firstElementChild?.lastElementChild as HTMLElement;
    await user.click(within(rightPanel).getAllByRole("button")[0]);
    expect(within(popup).getByText("2026년 9월")).toBeInTheDocument();
    expect(within(popup).getByText("2026년 10월")).toBeInTheDocument();

    await user.click(trigger.querySelector("span.cursor-pointer svg") as Element);

    expect(within(popup).getByText("2026년 8월")).toBeInTheDocument();
    expect(within(popup).getByText("2026년 9월")).toBeInTheDocument();
    expect(trigger).toHaveTextContent("시작 날짜종료 날짜");
  });

  it("keeps the first date while selecting a controlled range", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function ControlledRange() {
      const [value, setValue] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
      return (
        <DatePicker.RangePicker
          value={value}
          defaultPickerValue={dayjs("2026-08-01")}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }

    render(<ControlledRange />);
    const trigger = screen.getByRole("button", { name: /시작 날짜.*종료 날짜/ });
    await user.click(trigger);
    const popup = document.querySelector("[data-datepicker-range-popup]") as HTMLElement;

    await user.click(within(popup).getAllByRole("button", { name: "14" })[0]);
    expect(trigger).toHaveTextContent("2026-08-14");

    await user.click(within(popup).getAllByRole("button", { name: "15" })[0]);
    const changedRange = onChange.mock.calls[0]?.[0] as [Dayjs, Dayjs];
    expect(changedRange.map((date) => date.format("YYYY-MM-DD"))).toEqual([
      "2026-08-14",
      "2026-08-15",
    ]);
    expect(trigger).toHaveTextContent("2026-08-142026-08-15");
  });

  it("does not duplicate range styles on adjacent-month dates", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker.RangePicker
        defaultValue={[dayjs("2026-08-18"), dayjs("2026-09-03")]}
        defaultPickerValue={dayjs("2026-08-01")}
      />,
    );

    await user.click(screen.getByRole("button", { name: /2026-08-18.*2026-09-03/ }));
    const popup = document.querySelector("[data-datepicker-range-popup]") as HTMLElement;
    const septemberThirdButtons = within(popup).getAllByRole("button", { name: "3" });
    const selectedSeptemberThirdButtons = septemberThirdButtons.filter((button) =>
      button.className.includes("text-primary"),
    );

    expect(selectedSeptemberThirdButtons).toHaveLength(1);
  });

  it("removes one multiple value from its chip close icon", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        multiple
        defaultValue={[dayjs("2026-08-11"), dayjs("2026-08-14")]}
        onChange={onChange}
      />,
    );

    const tags = document.querySelectorAll("[data-datepicker-tag]");
    tags.forEach((tag) => expect(tag).toHaveClass("tabular-nums"));
    expect(tags[0]).toHaveAttribute("data-datepicker-layout-key", "tag:2026-08-11");

    const firstTag = tags[0];
    await user.click(firstTag.querySelector("svg")!);

    expect(onChange.mock.calls[0]?.[0].map((date: Dayjs) => date.format("YYYY-MM-DD"))).toEqual([
      "2026-08-14",
    ]);
    await waitFor(() => expect(screen.queryByText("2026-08-11")).not.toBeInTheDocument());
  });

  it("centers the clear button for multiple values", () => {
    render(<DatePicker multiple defaultValue={[dayjs("2026-08-11"), dayjs("2026-08-14")]} />);

    const trigger = screen.getByRole("button", { name: /2026-08-11.*2026-08-14/ });
    const clearButton = trigger.querySelector<HTMLElement>(":scope > span.cursor-pointer");

    expect(clearButton).toHaveClass("self-center");
  });
});
