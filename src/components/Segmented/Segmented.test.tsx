import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Segmented } from "./Segmented";

describe("Segmented", () => {
  it("selects an option and reports its value", async () => {
    const onChange = vi.fn();
    render(<Segmented options={["일", "주", "월"]} onChange={onChange} />);
    await userEvent.click(screen.getByText("주"));
    expect(onChange).toHaveBeenCalledWith("주");
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
});
