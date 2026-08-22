import { render, screen } from "@testing-library/react";
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
    await userEvent.click(await screen.findByRole("button", { name: "#ff0000" }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Color), "#ff0000");
  });
});
