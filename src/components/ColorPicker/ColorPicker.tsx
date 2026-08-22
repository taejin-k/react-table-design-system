import { createPortal } from "react-dom";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Icon } from "../Icon";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type {
  ColorFormat,
  ColorPickerProps,
  ColorValue,
  HsbColor,
  RgbColor,
} from "./ColorPicker.types";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
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
  if (hsb)
    return hsbToRgb({
      h: Number(hsb[1]),
      s: Number(hsb[2]) / 100,
      b: Number(hsb[3]) / 100,
      a: hsb[4] ? Number(hsb[4]) / (input.endsWith("%)") ? 100 : 1) : 1,
    });
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

function firstColor(value?: ColorValue) {
  return Array.isArray(value)
    ? (value[0]?.color ?? "#0062df")
    : typeof value === "string"
      ? value
      : value instanceof Color
        ? value.toCssString()
        : "#0062df";
}
function colorCss(value?: ColorValue) {
  return Array.isArray(value)
    ? `linear-gradient(90deg, ${value.map((stop) => `${stop.color} ${stop.percent}%`).join(", ")})`
    : firstColor(value);
}

export function ColorPicker({
  value,
  defaultValue = "#0062df",
  format: formatProp,
  defaultFormat = "hex",
  mode = "single",
  defaultMode = "single",
  size = "medium",
  disabled = false,
  disabledAlpha = false,
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
  const [innerValue, setInnerValue] = useState<ColorValue>(defaultValue);
  const selected = value ?? innerValue;
  const [innerFormat, setInnerFormat] = useState<ColorFormat>(defaultFormat);
  const format = formatProp ?? innerFormat;
  const [activeMode, setActiveMode] = useState(Array.isArray(mode) ? defaultMode : mode);
  const current = useMemo(() => new Color(firstColor(selected)), [selected]);
  const floating = useFloatingLayer({
    placement,
    trigger,
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
  const display =
    format === "hex"
      ? current.toHexString().toUpperCase()
      : format === "rgb"
        ? current.toRgbString()
        : current.toHsbString();
  const Picker = (
    <div className="grid gap-3">
      <div
        role="slider"
        aria-label="채도와 밝기"
        className="relative h-40 cursor-crosshair overflow-hidden rounded-md"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsb.h}, 100%, 50%))`,
        }}
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const next = new Color(
            hsbToRgb({
              h: hsb.h,
              s: clamp((event.clientX - rect.left) / rect.width),
              b: 1 - clamp((event.clientY - rect.top) / rect.height),
              a: hsb.a,
            }),
          );
          change(next, true);
        }}
      >
        <span
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${hsb.s * 100}%`, top: `${(1 - hsb.b) * 100}%` }}
        />
      </div>
      <div className="flex items-center gap-3">
        <span
          className="size-7 shrink-0 rounded-full border border-black/10"
          style={{ background: current.toCssString() }}
        />
        <div className="grid flex-1 gap-2">
          <input
            aria-label="색조"
            type="range"
            min={0}
            max={360}
            value={Math.round(hsb.h)}
            className="wizard-color-hue h-3 w-full appearance-none rounded-full"
            onChange={(event) =>
              change(new Color(hsbToRgb({ ...hsb, h: Number(event.target.value) })))
            }
            onPointerUp={() => onChangeComplete?.(current)}
          />
          {!disabledAlpha ? (
            <input
              aria-label="투명도"
              type="range"
              min={0}
              max={100}
              value={Math.round(hsb.a * 100)}
              className="wizard-color-alpha h-3 w-full appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, transparent, ${new Color({ ...current.toRgb(), a: 1 }).toHexString()})`,
              }}
              onChange={(event) =>
                change(new Color({ ...current.toRgb(), a: Number(event.target.value) / 100 }))
              }
              onPointerUp={() => onChangeComplete?.(current)}
            />
          ) : null}
        </div>
      </div>
      <div className="flex gap-2">
        <select
          aria-label="색상 형식"
          value={format}
          className="h-8 rounded-md border border-[#d9d9d9] bg-white px-2"
          onChange={(event) => {
            const next = event.target.value as ColorFormat;
            if (formatProp === undefined) setInnerFormat(next);
            onFormatChange?.(next);
          }}
        >
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsb">HSB</option>
        </select>
        <input
          aria-label="색상 값"
          value={display}
          className="h-8 min-w-0 flex-1 rounded-md border border-[#d9d9d9] px-2"
          onChange={(event) => change(new Color(event.target.value))}
          onBlur={() => onChangeComplete?.(current)}
        />
        {allowClear ? (
          <button
            type="button"
            aria-label="색상 지우기"
            className="inline-flex size-8 items-center justify-center rounded-md border border-[#d9d9d9]"
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
    <div className="grid gap-3 border-t border-[#f0f0f0] pt-3">
      {presets.map((preset, index) => (
        <details key={preset.key ?? index} open={preset.defaultOpen ?? true}>
          <summary className="cursor-pointer text-sm font-medium">{preset.label}</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {preset.colors.map((presetColor, colorIndex) => (
              <button
                key={colorIndex}
                type="button"
                aria-label={firstColor(presetColor)}
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
    <div className="grid gap-3">
      {Picker}
      {Presets}
    </div>
  );
  if (panelRender) panel = panelRender(panel, { components: { Picker, Presets } });
  const triggerContent = children ?? (
    <>
      <span
        className="size-6 rounded border border-black/10"
        style={{ background: colorCss(selected) }}
      />
      {showText ? (
        <span className="truncate">
          {typeof showText === "function" ? showText(current) : display}
        </span>
      ) : null}
      <Icon icon="chevron-down" size={12} />
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
          size === "large" ? "h-10 px-3" : size === "small" ? "h-6 px-2" : "h-8 px-2.5",
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
              className={twMerge(
                "fixed z-[1050] w-72 rounded-lg bg-white p-3 font-pretendard text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)] transition-[opacity,transform] duration-200",
                floating.isMotionVisible
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-95 opacity-0",
              )}
              style={{
                left: floating.position?.left ?? 0,
                top: floating.position?.top ?? 0,
                visibility: floating.position ? "visible" : "hidden",
              }}
              {...floating.popupProps}
            >
              {Array.isArray(mode) && mode.length > 1 ? (
                <div className="mb-3 flex rounded-md bg-[#f5f5f5] p-0.5">
                  {mode.map((entry) => (
                    <button
                      type="button"
                      key={entry}
                      className={twMerge(
                        "flex-1 rounded px-2 py-1 text-xs",
                        activeMode === entry && "bg-white shadow-sm",
                      )}
                      onClick={() => setActiveMode(entry)}
                    >
                      {entry === "single" ? "단색" : "그라데이션"}
                    </button>
                  ))}
                </div>
              ) : null}
              {panel}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
