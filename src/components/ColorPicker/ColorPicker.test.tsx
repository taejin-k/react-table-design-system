import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Color, ColorPicker } from "./ColorPicker";

describe("ColorPicker", () => {
  it("converts colors through the public Color API", () => {
    const color = new Color("#0062df80");
    expect(color.toHexString()).toBe("#0062df80");
    expect(color.toRgb()).toEqual({ r: 0, g: 98, b: 223, a: expect.closeTo(0.502, 2) });
    expect(color.toHsb().h).toBeGreaterThan(200);
  });

  it("opens the panel and applies a preset", async () => {
    const onChange = vi.fn();
    render(
      <ColorPicker presets={[{ label: "브랜드", colors: ["#ff0000"] }]} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("button"));
    const preset = (await screen.findByText("브랜드")).closest("details")?.querySelector("button");
    await userEvent.click(preset!);
    expect(onChange).toHaveBeenCalledWith(expect.any(Color), "#ff0000");
  });

  it("keeps the panel open while changing the nested format select", async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#0062df" />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: "HEX" }));
    const formatOptions = document.querySelectorAll("[data-select-popup] button");
    fireEvent.click(formatOptions[1]);

    expect(document.querySelector("[data-colorpicker-popup]")).toBeInTheDocument();
    expect(screen.getByDisplayValue("rgb(0, 98, 223)")).toBeInTheDocument();
  });

  it("constrains every panel section to the fixed popup width", async () => {
    render(<ColorPicker defaultValue="#0062df" />);

    await userEvent.click(screen.getByRole("button"));

    const popup = document.querySelector("[data-colorpicker-popup]");
    expect(popup).toHaveClass("w-[234px]", "overflow-hidden");
    expect(popup?.firstElementChild).toHaveClass("w-full", "min-w-0", "overflow-hidden");
  });

  it("synchronizes the panel, input, and saturation point when cleared", async () => {
    render(<ColorPicker defaultValue="#0062df" showText allowClear />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(document.querySelector("[data-colorpicker-clear]")!);

    expect(screen.getByDisplayValue("#FFFFFF")).toBeInTheDocument();
    expect(document.querySelector("[data-colorpicker-saturation-thumb]")).toHaveStyle({
      left: "0%",
      top: "0%",
    });
    expect(screen.getByRole("button", { name: /#FFFFFF/ })).toBeInTheDocument();
  });

  it("updates alpha continuously after the color is cleared to white", async () => {
    render(<ColorPicker defaultValue="#0062df" showText allowClear />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(document.querySelector("[data-colorpicker-clear]")!);

    const alpha = document.querySelector(".wizard-color-alpha") as HTMLInputElement;
    fireEvent.input(alpha, { target: { value: "40" } });

    expect(alpha).toHaveValue("40");
    expect(screen.getByDisplayValue("#FFFFFF66")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /#FFFFFF66/ })).toBeInTheDocument();
  });
});
