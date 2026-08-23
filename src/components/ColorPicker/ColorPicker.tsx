import { createPortal } from "react-dom";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { Input } from "../Input";
import { Select } from "../Select";
import { getPopupMotionStyle } from "../_internal/motion";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type {
  ColorFormatType,
  ColorGradientType,
  ColorPickerProps,
  ColorValueType,
  HsbColor,
  RgbColor,
} from "./ColorPicker.types";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function isValidColorInput(value: string, format: ColorFormatType) {
  const input = value.trim();
  if (format === "hex") return /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(input);
  if (format === "rgb") {
    return /^rgba?\(\s*[\d.]+[,\s]+[\d.]+[,\s]+[\d.]+(?:[,/\s]+[\d.]+%?)?\s*\)$/i.test(input);
  }
  return /^hs[bg]\(\s*[\d.]+[,\s]+[\d.]+%[,\s]+[\d.]+%(?:[,/\s]+[\d.]+%?)?\s*\)$/i.test(input);
}
function rgbToHsb({ r, g, b, a = 1 }: RgbColor): HsbColor {
  const red = r / 255,
    green = g / 255,
    blue = b / 255;
  const max = Math.max(red, green, blue),
    min = Math.min(red, green, blue),
    delta = max - min;
  let h = 0;
  if (delta)
    h =
      max === red
        ? 60 * (((green - blue) / delta) % 6)
        : max === green
          ? 60 * ((blue - red) / delta + 2)
          : 60 * ((red - green) / delta + 4);
  if (h < 0) h += 360;
  return { h, s: max ? delta / max : 0, b: max, a };
}
function hsbToRgb({ h, s, b, a = 1 }: HsbColor): RgbColor {
  const c = b * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = b - c;
  const [r, g, blue] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((blue + m) * 255),
    a,
  };
}
function parseColor(value: string | RgbColor | HsbColor = "#0062df"): RgbColor {
  if (typeof value === "object")
    return "r" in value ? { ...value, a: value.a ?? 1 } : hsbToRgb(value);
  const input = value.trim().toLowerCase();
  const hex = input.match(/^#([\da-f]{3,8})$/i)?.[1];
  if (hex) {
    const expanded =
      hex.length === 3 || hex.length === 4
        ? hex
            .split("")
            .map((char) => char + char)
            .join("")
        : hex;
    return {
      r: parseInt(expanded.slice(0, 2), 16),
      g: parseInt(expanded.slice(2, 4), 16),
      b: parseInt(expanded.slice(4, 6), 16),
      a: expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : 1,
    };
  }
  const rgb = input.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+)%?)?\s*\)$/,
  );
  if (rgb)
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] ? Number(rgb[4]) / (input.includes("%") ? 100 : 1) : 1,
    };
  const hsb = input.match(
    /^hs[bg]\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%(?:[,/\s]+([\d.]+)%?)?\s*\)$/,
  );
  if (hsb) {
    const alphaDivisor = input.endsWith("%)") ? 100 : 1;
    return hsbToRgb({
      h: Number(hsb[1]),
      s: Number(hsb[2]) / 100,
      b: Number(hsb[3]) / 100,
      a: hsb[4] ? Number(hsb[4]) / alphaDivisor : 1,
    });
  }
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  const context = canvas?.getContext("2d");
  if (context) {
    context.fillStyle = "#0062df";
    context.fillStyle = input;
    if (context.fillStyle.startsWith("#")) return parseColor(context.fillStyle);
  }
  return { r: 0, g: 98, b: 223, a: 1 };
}

export class Color {
  private rgb: RgbColor;
  constructor(value?: string | RgbColor | HsbColor) {
    this.rgb = parseColor(value);
  }
  toCssString() {
    return this.rgb.a < 1 ? this.toRgbString() : this.toHexString();
  }
  toHex() {
    const { r, g, b, a } = this.rgb;
    const base = [r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("");
    return a < 1
      ? `${base}${Math.round(a * 255)
          .toString(16)
          .padStart(2, "0")}`
      : base;
  }
  toHexString() {
    return `#${this.toHex()}`;
  }
  toHsb() {
    return rgbToHsb(this.rgb);
  }
  toHsbString() {
    const { h, s, b, a } = this.toHsb();
    return `hsb(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(b * 100)}%${a < 1 ? `, ${Number(a.toFixed(2))}` : ""})`;
  }
  toRgb() {
    return { ...this.rgb };
  }
  toRgbString() {
    const { r, g, b, a } = this.rgb;
    return a < 1
      ? `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(a.toFixed(2))})`
      : `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }
}

function firstColor(value?: ColorValueType | ColorGradientType) {
  return Array.isArray(value)
    ? (value[0]?.color ?? "#0062df")
    : typeof value === "string"
      ? value || "#ffffff"
      : value instanceof Color
        ? value.toCssString()
        : "#0062df";
}
function colorCss(value?: ColorValueType | ColorGradientType) {
  return Array.isArray(value)
    ? `linear-gradient(90deg, ${value.map((stop) => `${stop.color} ${stop.percent}%`).join(", ")})`
    : firstColor(value);
}

export function ColorPicker({
  value,
  defaultValue = "#0062df",
  format: formatProp,
  defaultFormat = "hex",
  size = "medium",
  disabled = false,
  allowClear = false,
  open,
  defaultOpen = false,
  trigger = "click",
  placement = "bottomLeft",
  showText = false,
  presets = [],
  children,
  panelRender,
  className,
  style,
  onChange,
  onChangeComplete,
  onFormatChange,
  onOpenChange,
  onClear,
}: ColorPickerProps) {
  const [innerValue, setInnerValue] = useState<ColorValueType>(defaultValue);
  const selected = value ?? innerValue;
  const [innerFormat, setInnerFormat] = useState<ColorFormatType>(defaultFormat);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const format = formatProp ?? innerFormat;
  const current = useMemo(() => new Color(firstColor(selected)), [selected]);
  const floating = useFloatingLayer({
    placement,
    trigger,
    targetGap: 2,
    disabled,
    open,
    defaultOpen,
    onOpenChange,
  });
  const change = (next: Color, complete = false) => {
    if (value === undefined) setInnerValue(next.toCssString());
    onChange?.(next, next.toCssString());
    if (complete) onChangeComplete?.(next);
  };
  const hsb = current.toHsb();
  const saturationFromPoint = (element: HTMLElement, clientX: number, clientY: number) => {
    const rect = element.getBoundingClientRect();
    return new Color(
      hsbToRgb({
        h: hsb.h,
        s: clamp((clientX - rect.left) / rect.width),
        b: 1 - clamp((clientY - rect.top) / rect.height),
        a: hsb.a,
      }),
    );
  };
  const display =
    format === "hex"
      ? current.toHexString().toUpperCase()
      : format === "rgb"
        ? current.toRgbString()
        : current.toHsbString();
  const Picker = (
    <div className="grid w-full max-w-full min-w-0 gap-3 overflow-hidden">
      <div
        data-colorpicker-saturation
        className="relative h-40 cursor-crosshair overflow-hidden rounded-md"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsb.h}, 100%, 50%))`,
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          change(saturationFromPoint(event.currentTarget, event.clientX, event.clientY));
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          change(saturationFromPoint(event.currentTarget, event.clientX, event.clientY));
        }}
        onPointerUp={(event) => {
          const next = saturationFromPoint(event.currentTarget, event.clientX, event.clientY);
          change(next, true);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        <span
          data-colorpicker-saturation-thumb
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${hsb.s * 100}%`, top: `${(1 - hsb.b) * 100}%` }}
        />
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="size-7 shrink-0 rounded-full border border-black/10"
          style={{ background: current.toCssString() }}
        />
        <div className="grid min-w-0 flex-1 gap-2 px-1">
          <input
            type="range"
            min={0}
            max={360}
            value={Math.round(hsb.h)}
            className="wizard-color-hue h-3 w-full min-w-0 appearance-none rounded-full"
            onChange={(event) =>
              change(new Color(hsbToRgb({ ...hsb, h: Number(event.target.value) })))
            }
            onPointerUp={(event) =>
              onChangeComplete?.(
                new Color(hsbToRgb({ ...hsb, h: Number(event.currentTarget.value) })),
              )
            }
          />
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(hsb.a * 100)}
            className="wizard-color-alpha h-3 w-full min-w-0 appearance-none rounded-full"
            style={{
              background: `linear-gradient(to right, transparent, ${new Color({ ...current.toRgb(), a: 1 }).toHexString()})`,
            }}
            onInput={(event) =>
              change(new Color({ ...current.toRgb(), a: Number(event.currentTarget.value) / 100 }))
            }
            onPointerUp={(event) =>
              onChangeComplete?.(
                new Color({ ...current.toRgb(), a: Number(event.currentTarget.value) / 100 }),
              )
            }
          />
        </div>
      </div>
      <div className="flex min-w-0 gap-2">
        <Select
          value={format}
          width={76}
          options={[
            { label: "HEX", value: "hex" },
            { label: "RGB", value: "rgb" },
            { label: "HSB", value: "hsb" },
          ]}
          onChange={(nextValue) => {
            if (typeof nextValue !== "string") return;
            const next = nextValue as ColorFormatType;
            setEditing(false);
            if (formatProp === undefined) setInnerFormat(next);
            onFormatChange?.(next);
          }}
        />
        <Input
          value={editing ? draft : display}
          className="min-w-0 flex-1"
          onFocus={() => {
            setDraft(display);
            setEditing(true);
          }}
          onChange={(nextValue) => {
            setDraft(nextValue);
            if (isValidColorInput(nextValue, format)) change(new Color(nextValue));
          }}
          onBlur={() => {
            setEditing(false);
            onChangeComplete?.(current);
          }}
        />
        {allowClear ? (
          <button
            data-colorpicker-clear
            type="button"
            className="inline-flex size-[30px] items-center justify-center rounded-md border border-[#d9d9d9]"
            onClick={() => {
              if (value === undefined) setInnerValue("");
              onClear?.();
            }}
          >
            <Icon icon="delete-outlined" />
          </button>
        ) : null}
      </div>
    </div>
  );
  const Presets = presets.length ? (
    <div className="grid w-full max-w-full min-w-0 gap-3 overflow-hidden border-t border-[#f0f0f0] pt-3">
      {presets.map((preset, index) => (
        <details key={preset.key ?? index} open={preset.defaultOpen ?? true} className="min-w-0">
          <summary className="cursor-pointer text-sm font-medium">{preset.label}</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {preset.colors.map((presetColor, colorIndex) => (
              <button
                key={colorIndex}
                type="button"
                className="size-6 rounded border border-black/10 transition-transform hover:scale-110"
                style={{ background: colorCss(presetColor) }}
                onClick={() => change(new Color(firstColor(presetColor)), true)}
              />
            ))}
          </div>
        </details>
      ))}
    </div>
  ) : null;
  let panel: React.ReactNode = (
    <div className="grid w-full max-w-full min-w-0 gap-3 overflow-hidden">
      {Picker}
      {Presets}
    </div>
  );
  if (panelRender) panel = panelRender(panel, { components: { Picker, Presets } });
  const triggerContent = children ?? (
    <>
      <span
        className={twMerge(
          "rounded border border-black/10",
          size === "large" ? "size-8" : size === "small" ? "size-4" : "size-6",
        )}
        style={{ background: colorCss(selected) }}
      />
      {showText ? (
        <span className="truncate">
          {typeof showText === "function" ? showText(current) : display}
        </span>
      ) : null}
      <Icon
        icon="chevron-down"
        size={12}
        className={twMerge("transition-transform", floating.isOpen && "rotate-180")}
      />
    </>
  );
  return (
    <>
      <button
        ref={floating.triggerRef as React.RefObject<HTMLButtonElement | null>}
        type="button"
        disabled={disabled}
        className={twMerge(
          "inline-flex items-center gap-2 rounded-md border border-[#d9d9d9] bg-white font-pretendard text-sm text-[#111] transition-colors hover:border-[#0062df] disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#bbb]",
          size === "large" ? "h-10 p-[3px]" : size === "small" ? "h-6 p-[3px]" : "h-8 p-[3px]",
          className,
        )}
        style={style}
        {...floating.triggerProps}
      >
        {triggerContent}
      </button>
      {floating.isRendered && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={floating.popupRef}
              data-colorpicker-popup
              className={twMerge(
                "fixed z-[1050] box-border w-[234px] max-w-[calc(100vw-16px)] overflow-hidden rounded-lg bg-white p-3 font-pretendard text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.06),0_3px_6px_-4px_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.03)]",
                !floating.isMotionVisible && "pointer-events-none",
              )}
              style={{
                left: floating.position?.left ?? 0,
                top: floating.position?.top ?? 0,
                visibility: floating.position ? "visible" : "hidden",
                ...getPopupMotionStyle(
                  floating.position?.placement ?? placement,
                  floating.isMotionVisible && Boolean(floating.position),
                ),
              }}
              {...floating.popupProps}
            >
              {panel}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
