import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from "./ColorPicker";

describe("ColorPicker", () => {
  it("uses sm, md, and lg trigger sizes", () => {
    const { container } = render(
      <>
        <ColorPicker size="sm" />
        <ColorPicker size="md" />
        <ColorPicker size="lg" />
      </>,
    );

    const triggers = container.querySelectorAll("button");
    expect(triggers[0]).toHaveClass("h-6");
    expect(triggers[1]).toHaveClass("h-8");
    expect(triggers[2]).toHaveClass("h-10");
  });

  it("opens the panel and returns preset colors as strings", async () => {
    const onChange = vi.fn();
    const onChangeComplete = vi.fn();
    render(
      <ColorPicker
        presets={[{ label: "브랜드", colors: ["#ff0000"] }]}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />,
    );
    await userEvent.click(screen.getByRole("button"));
    const preset = (await screen.findByText("브랜드")).nextElementSibling?.querySelector("button");
    await userEvent.click(preset!);
    expect(onChange).toHaveBeenCalledWith("#ff0000");
    expect(onChange.mock.calls[0]).toHaveLength(1);
    expect(onChangeComplete).toHaveBeenCalledWith("#ff0000");
    expect(onChangeComplete.mock.calls[0]).toHaveLength(1);
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
    expect(popup).toHaveClass("w-72", "overflow-hidden");
    expect(popup?.firstElementChild).toHaveClass("w-full", "min-w-0", "overflow-hidden");
    expect(document.querySelector(".wizard-color-hue")).toHaveClass(
      "cursor-grab",
      "active:cursor-grabbing",
    );
    expect(document.querySelector(".wizard-color-alpha")).toHaveClass(
      "cursor-grab",
      "active:cursor-grabbing",
    );
  });

  it("synchronizes the panel, input, and saturation point when cleared", async () => {
    render(<ColorPicker defaultValue="#0062df" showLabel allowClear />);

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
    render(<ColorPicker defaultValue="#0062df" showLabel allowClear />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(document.querySelector("[data-colorpicker-clear]")!);

    const alpha = document.querySelector(".wizard-color-alpha") as HTMLInputElement;
    expect(alpha.style.getPropertyValue("--wizard-color-alpha-color")).toBe("#ffffff");
    fireEvent.input(alpha, { target: { value: "40" } });

    expect(alpha).toHaveValue("40");
    expect(screen.getByDisplayValue("#FFFFFF66")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /#FFFFFF66/ })).toBeInTheDocument();
  });

  it("keeps the hue slider interactive after clearing to white", async () => {
    render(<ColorPicker defaultValue="#0062df" showLabel allowClear />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(document.querySelector("[data-colorpicker-clear]")!);

    const hue = document.querySelector(".wizard-color-hue") as HTMLInputElement;
    fireEvent.input(hue, { target: { value: "120" } });

    expect(hue).toHaveValue("120");
    expect(screen.getByDisplayValue("#FFFFFF")).toBeInTheDocument();
  });

  it("keeps the hue slider at the right endpoint", async () => {
    render(<ColorPicker defaultValue="#0062df" showLabel />);

    await userEvent.click(screen.getByRole("button"));
    const hue = document.querySelector(".wizard-color-hue") as HTMLInputElement;
    fireEvent.input(hue, { target: { value: "360" } });

    expect(hue).toHaveValue("360");
    expect(screen.getByDisplayValue("#DF0000")).toBeInTheDocument();
  });
});
