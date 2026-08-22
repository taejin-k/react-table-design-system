import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Segmented } from "./Segmented";

describe("Segmented", () => {
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
    expect(disabledItem).toHaveClass("cursor-not-allowed", "text-[#bbb]");
    expect(disabledItem).not.toHaveClass("hover:text-[#111]");
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
    const { container } = render(
      <Segmented
        options={[
          { label: "짧게", value: "short" },
          { label: "더 긴 선택지", value: "long" },
        ]}
      />,
    );
    const thumb = container.querySelector("[data-segmented-thumb]");

    expect(thumb).toHaveClass("transition-none");

    await userEvent.click(screen.getByText("더 긴 선택지"));

    expect(thumb).toHaveClass("duration-300", "ease-[cubic-bezier(0.645,0.045,0.355,1)]");
  });

  it("fills its parent width when fullWidth is enabled", () => {
    const { container } = render(<Segmented fullWidth options={[{ label: "일", value: "day" }]} />);

    expect(container.firstElementChild).toHaveClass("w-full");
  });

  it("lays out its options vertically when vertical is enabled", () => {
    const { container } = render(<Segmented vertical options={[{ label: "일", value: "day" }]} />);

    expect(container.firstElementChild).toHaveClass("flex-col");
  });
});
