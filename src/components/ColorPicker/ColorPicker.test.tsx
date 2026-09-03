import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColorPicker } from "./ColorPicker";

describe("ColorPicker", () => {
  it("applies className to the trigger root without adding ARIA attributes", async () => {
    const { container } = render(
      <ColorPicker className="w-48 justify-between" defaultValue="#0062df" showLabel />,
    );

    expect(container.firstChild).toHaveClass("w-48", "justify-between");
    await userEvent.click(screen.getByRole("button"));
    expect(document.body.innerHTML).not.toMatch(/\saria-[\w-]+=/);
  });

  it("honors disabled and controlled open state", async () => {
    const { rerender } = render(<ColorPicker disabled />);

    await userEvent.click(screen.getByRole("button"));
    expect(document.querySelector("[data-colorpicker-popup]")).not.toBeInTheDocument();

    rerender(<ColorPicker open />);
    expect(document.querySelector("[data-colorpicker-popup]")).toBeInTheDocument();
  });

  it("keeps the trigger focusable without opening while read only", async () => {
    const onOpenChange = vi.fn();
    const onChange = vi.fn();
    render(
      <ColorPicker
        readOnly
        defaultValue="#0062df"
        showLabel
        onOpenChange={onOpenChange}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: /#0062DF/ });
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveClass("cursor-default", "focus:border-primary", "focus:outline-none");

    await userEvent.click(trigger);

    expect(trigger).toHaveFocus();
    expect(document.querySelector("[data-colorpicker-popup]")).not.toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses defaultOpen and reports user-driven open changes", async () => {
    const onOpenChange = vi.fn();
    const { container } = render(<ColorPicker defaultOpen onOpenChange={onOpenChange} />);

    expect(document.querySelector("[data-colorpicker-popup]")).toBeInTheDocument();
    await userEvent.click(container.querySelector("button")!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange.mock.calls[0]).toHaveLength(1);
  });

  it("uses controlled value and format and reports clear actions", async () => {
    const onClear = vi.fn();
    render(
      <ColorPicker
        value="rgba(0, 98, 223, 0.5)"
        format="rgb"
        showLabel
        allowClear
        onClear={onClear}
      />,
    );

    expect(screen.getByRole("button", { name: /rgba\(0, 98, 223, 0.5\)/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(document.querySelector("[data-colorpicker-clear]")!);
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("reports format changes using the public string type", async () => {
    const onFormatChange = vi.fn();
    render(<ColorPicker defaultValue="#0062df" onFormatChange={onFormatChange} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("button", { name: "HEX" }));
    const formatOptions = document.querySelectorAll("[data-select-popup] button");
    fireEvent.click(formatOptions[1]);

    expect(onFormatChange).toHaveBeenCalledWith("rgb");
    expect(onFormatChange.mock.calls[0]).toHaveLength(1);
  });

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
