import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { Segmented } from "./Segmented";

describe("Segmented", () => {
  it("removes the selection thumb when the selected option is removed", () => {
    const { container, rerender } = render(
      <Segmented value="a" options={[{ value: "a", label: "A" }]} />,
    );
    expect(container.querySelector("[data-segmented-thumb]")).toBeInTheDocument();
    rerender(<Segmented value="a" options={[]} />);
    expect(container.querySelector("[data-segmented-thumb]")).not.toBeInTheDocument();
  });

  it("groups its native radios without affecting another Segmented", () => {
    render(
      <>
        <Segmented
          options={[
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ]}
        />
        <Segmented options={[{ value: "c", label: "C" }]} />
      </>,
    );
    const inputs = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(inputs[0].name).toBeTruthy();
    expect(inputs[1].name).toBe(inputs[0].name);
    expect(inputs[2].name).not.toBe(inputs[0].name);
  });

  it("fits its content by default", () => {
    const { container } = render(<Segmented options={[{ label: "일", value: "day" }]} />);

    expect(container.firstElementChild).toHaveClass("w-fit", "rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("w-full");
    expect(container.querySelector("label")).toHaveClass("rounded-md");
    expect(container.querySelector("[data-segmented-thumb]")).toHaveClass("rounded-md");
  });

  it("does not apply hover styling to disabled items", () => {
    render(
      <Segmented
        options={[
          { disabled: true, label: "비활성", value: "disabled" },
          { label: "기본", value: "enabled" },
        ]}
      />,
    );

    const disabledItem = screen.getByRole("radio", { name: "비활성" }).closest("label");
    expect(disabledItem).toHaveClass("cursor-not-allowed", "text-disabled");
    expect(disabledItem).not.toHaveClass("hover:text-dark");
  });

  it("selects the first enabled option by default", () => {
    render(
      <Segmented
        options={[
          { disabled: true, label: "비활성", value: "disabled" },
          { label: "기본", value: "enabled" },
        ]}
      />,
    );

    expect(screen.getByRole("radio", { name: "비활성" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "기본" })).toBeChecked();
  });

  it("selects an option and reports its value", async () => {
    const onChange = vi.fn();
    render(
      <Segmented
        options={[
          { label: "일", value: "day" },
          { label: "주", value: "week" },
          { label: "월", value: "month" },
        ]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByText("주"));
    expect(onChange).toHaveBeenCalledWith("week");
    expect(screen.getByRole("radio", { name: "주" })).toBeChecked();
  });

  it("supports bigint item keys", async () => {
    const onChange = vi.fn();
    render(
      <Segmented
        options={[
          { label: "첫 번째", value: 1n },
          { label: "두 번째", value: 2n },
        ]}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByText("두 번째"));

    expect(onChange).toHaveBeenCalledWith(2n);
    expect(screen.getByRole("radio", { name: "두 번째" })).toBeChecked();
  });

  it("does not select a disabled option", async () => {
    const onChange = vi.fn();
    render(
      <Segmented
        options={[{ label: "비활성", value: "off", disabled: true }]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByText("비활성"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves the selection thumb with the Ant Design motion curve", async () => {
    let enableAnimation: FrameRequestCallback | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      enableAnimation = callback;
      return 1;
    });
    const { container } = render(
      <StrictMode>
        <Segmented
          options={[
            { label: "짧게", value: "short" },
            { label: "더 긴 선택지", value: "long" },
          ]}
        />
      </StrictMode>,
    );
    const thumb = container.querySelector("[data-segmented-thumb]");

    expect(thumb).toHaveClass("transition-none");

    act(() => enableAnimation?.(0));

    await userEvent.click(screen.getByText("더 긴 선택지"));

    expect(thumb).toHaveClass("duration-200", "ease-[cubic-bezier(0.645,0.045,0.355,1)]");
  });

  it("fills its parent width when fullWidth is enabled", () => {
    const { container } = render(<Segmented fullWidth options={[{ label: "일", value: "day" }]} />);

    expect(container.firstElementChild).toHaveClass("w-full");
  });

  it("shares the full width between options with tooltips", () => {
    const { container } = render(
      <Segmented
        fullWidth
        options={[
          { label: "목록", tooltip: "목록으로 표시해요.", value: "list" },
          { label: "달력", tooltip: "달력으로 표시해요.", value: "calendar" },
          { disabled: true, label: "잠김", tooltip: "사용할 수 없어요.", value: "locked" },
        ]}
      />,
    );

    const root = container.firstElementChild;
    const tooltipTriggers = root?.querySelectorAll(":scope > span:not([data-segmented-thumb])");

    expect(tooltipTriggers).toHaveLength(3);
    tooltipTriggers?.forEach((trigger) => expect(trigger).toHaveClass("flex-1"));
  });

  it("fills every vertical row when fullWidth is enabled", () => {
    const { container } = render(
      <Segmented
        fullWidth
        vertical
        options={[
          { label: "목록", tooltip: "목록으로 표시해요.", value: "list" },
          { label: "달력", tooltip: "달력으로 표시해요.", value: "calendar" },
          { disabled: true, label: "잠김", value: "locked" },
        ]}
      />,
    );

    const root = container.firstElementChild;
    const tooltipTriggers = root?.querySelectorAll(":scope > span:not([data-segmented-thumb])");
    const directItem = root?.querySelector(":scope > label");

    expect(tooltipTriggers).toHaveLength(2);
    tooltipTriggers?.forEach((trigger) => expect(trigger).toHaveClass("w-full"));
    expect(directItem).toHaveClass("w-full");
  });

  it("lays out its options vertically when vertical is enabled", () => {
    const { container } = render(<Segmented vertical options={[{ label: "일", value: "day" }]} />);

    expect(container.firstElementChild).toHaveClass("flex-col");
  });
});
