import { createPortal } from "react-dom";
import {
  Fragment,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Chip } from "../Chip";
import { ErrorText } from "../ErrorText";
import { Icon } from "../Icon";
import { Input } from "../Input";
import { Label } from "../Label";
import { ScrollFade } from "../_internal/ScrollFade";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type {
  SelectLabeledValue,
  SelectOption,
  SelectProps,
  SelectRef,
  SelectValue,
} from "./Select.types";

const OPTION_HEIGHT = 32;
const OPTION_GAP = 2;
const ITEM_HEIGHT = OPTION_HEIGHT + OPTION_GAP;

function flattenOptions(options: SelectOption[]): SelectOption[] {
  return options.flatMap((option) => {
    if (!option.options) return [option];
    return flattenOptions(option.options).map((child, index) => ({
      ...child,
      __groupLabel: index === 0 ? option.label : undefined,
    }));
  });
}

function normalizeOptions(
  options: SelectOption[],
  fieldNames?: SelectProps["fieldNames"],
): SelectOption[] {
  if (!fieldNames) return options;
  const labelKey = fieldNames.label ?? "label";
  const groupLabelKey = fieldNames.groupLabel ?? labelKey;
  const valueKey = fieldNames.value ?? "value";
  const optionsKey = fieldNames.options ?? "options";
  return options.map((option) => {
    const children = option[optionsKey];
    return {
      ...option,
      label: option[Array.isArray(children) ? groupLabelKey : labelKey] as ReactNode,
      value: option[valueKey] as SelectValue | undefined,
      options: Array.isArray(children)
        ? normalizeOptions(children as SelectOption[], fieldNames)
        : undefined,
    };
  });
}

function optionText(option: SelectOption, property: string | string[] = "label") {
  const properties = Array.isArray(property) ? property : [property];
  return properties
    .map((key) => {
      const content = option[key];
      return typeof content === "string" || typeof content === "number" ? String(content) : "";
    })
    .join(" ");
}

function rawValue(value: SelectValue | SelectLabeledValue) {
  return typeof value === "object" ? value.value : value;
}

function normalizeValue(value: SelectProps["value"] | SelectProps["defaultValue"]) {
  if (value === undefined || value === null || value === "") return [];
  return (Array.isArray(value) ? value : [value]).map(rawValue);
}

export const Select = forwardRef<SelectRef, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      mode,
      placeholder = "선택하세요",
      size = "md",
      variant = "default",
      status,
      label,
      errorText,
      required = false,
      disabled = false,
      allowClear = false,
      showSearch = mode === "multiple" || mode === "tags",
      searchValue,
      autoClearSearchValue = true,
      defaultActiveFirstOption = true,
      filterOption = true,
      filterSort,
      optionFilterProp = "label",
      optionLabelProp,
      open,
      defaultOpen = false,
      placement = "bottomLeft",
      notFoundContent = "검색 결과가 없어요",
      fieldNames,
      labelInValue = false,
      listHeight = 256,
      loading = false,
      maxCount,
      maxTagCount,
      maxTagPlaceholder,
      maxTagTextLength,
      popupMatchSelectWidth = true,
      prefix,
      suffixIcon,
      removeIcon,
      menuItemSelectedIcon,
      tokenSeparators,
      virtual = true,
      optionRender,
      popupRender,
      tagRender,
      labelRender,
      className,
      onChange,
      onSearch,
      onSelect,
      onDeselect,
      onClear,
      onOpenChange,
      onFocus,
      onBlur,
      onInputKeyDown,
      onPopupScroll,
    },
    forwardedRef,
  ) => {
    const normalizedOptions = useMemo(
      () => normalizeOptions(options, fieldNames),
      [fieldNames, options],
    );
    const flatOptions = useMemo(() => flattenOptions(normalizedOptions), [normalizedOptions]);
    const [innerValue, setInnerValue] = useState<SelectValue[]>(() => normalizeValue(defaultValue));
    const [innerSearchValue, setInnerSearchValue] = useState("");
    const [activeIndex, setActiveIndex] = useState(defaultActiveFirstOption ? 0 : -1);
    const [triggerWidth, setTriggerWidth] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tagContainerRef = useRef<HTMLSpanElement>(null);
    const tagMeasureRef = useRef<HTMLSpanElement>(null);
    const [responsiveTagCount, setResponsiveTagCount] = useState(0);
    const values = value === undefined ? innerValue : normalizeValue(value);
    const searchConfig = typeof showSearch === "object" ? showSearch : undefined;
    const query = searchConfig?.searchValue ?? searchValue ?? innerSearchValue;
    const isSearchable = Boolean(showSearch);
    const effectiveFilter = searchConfig?.filterOption ?? filterOption;
    const effectiveFilterSort = searchConfig?.filterSort ?? filterSort;
    const effectiveFilterProp = searchConfig?.optionFilterProp ?? optionFilterProp;
    const effectiveAutoClear = searchConfig?.autoClearSearchValue ?? autoClearSearchValue;
    const effectiveOnSearch = searchConfig?.onSearch ?? onSearch;

    useImperativeHandle(forwardedRef, () => ({
      focus: () => buttonRef.current?.focus(),
      blur: () => buttonRef.current?.blur(),
    }));

    const selectedOptions = values.map(
      (selected) =>
        flatOptions.find((option) => option.value === selected) ?? {
          label: String(selected),
          value: selected,
        },
    );

    const measureResponsiveTags = useCallback(() => {
      if (maxTagCount !== "responsive") return;
      const container = tagContainerRef.current;
      const measure = tagMeasureRef.current;
      if (!container || !measure) return;

      const tagWidths = Array.from(
        measure.querySelectorAll<HTMLElement>("[data-select-measure-tag]"),
      ).map((tag) => tag.getBoundingClientRect().width);
      const placeholderWidth =
        measure
          .querySelector<HTMLElement>("[data-select-measure-placeholder]")
          ?.getBoundingClientRect().width ?? 0;
      const availableWidth = container.getBoundingClientRect().width;
      const gap = 6;
      let usedWidth = 0;
      let nextCount = 0;

      for (let index = 0; index < tagWidths.length; index += 1) {
        const nextWidth = usedWidth + (nextCount ? gap : 0) + tagWidths[index];
        const hasOmittedTags = index < tagWidths.length - 1;
        const reservedWidth = hasOmittedTags ? gap + placeholderWidth : 0;
        if (nextWidth + reservedWidth > availableWidth) break;
        usedWidth = nextWidth;
        nextCount += 1;
      }

      setResponsiveTagCount((current) => (current === nextCount ? current : nextCount));
    }, [maxTagCount]);

    useLayoutEffect(() => {
      if (maxTagCount !== "responsive") return;
      measureResponsiveTags();
      const container = tagContainerRef.current;
      if (!container || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measureResponsiveTags);
      observer.observe(container);
      return () => observer.disconnect();
    }, [measureResponsiveTags, maxTagCount, maxTagPlaceholder, selectedOptions.length]);

    const visibleOptions = useMemo(() => {
      const normalizedQuery = query.trim().toLocaleLowerCase();
      const filtered = !normalizedQuery
        ? flatOptions
        : flatOptions.filter((option) => {
            if (typeof effectiveFilter === "function") return effectiveFilter(query, option);
            if (!effectiveFilter) return true;
            return optionText(option, effectiveFilterProp)
              .toLocaleLowerCase()
              .includes(normalizedQuery);
          });
      return effectiveFilterSort
        ? [...filtered].sort((a, b) => effectiveFilterSort(a, b, { searchValue: query }))
        : filtered;
    }, [effectiveFilter, effectiveFilterProp, effectiveFilterSort, flatOptions, query]);

    const floating = useFloatingLayer({
      placement,
      trigger: "click",
      disabled,
      open,
      defaultOpen,
      closeOnScroll: true,
      targetGap: 2,
      onOpenChange: (nextOpen) => {
        if (nextOpen) {
          setTriggerWidth(buttonRef.current?.getBoundingClientRect().width ?? 0);
          setActiveIndex(defaultActiveFirstOption ? 0 : -1);
        } else if (searchValue === undefined && searchConfig?.searchValue === undefined) {
          setInnerSearchValue("");
        }
        onOpenChange?.(nextOpen);
      },
    });

    useLayoutEffect(() => {
      if (!floating.isOpen) {
        setTriggerWidth(0);
        return;
      }

      const trigger = floating.triggerRef.current;
      if (!trigger) return;
      const updateTriggerWidth = () => setTriggerWidth(trigger.getBoundingClientRect().width);
      updateTriggerWidth();

      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(updateTriggerWidth);
      observer.observe(trigger);
      return () => observer.disconnect();
    }, [floating.isOpen, floating.triggerRef]);

    const toOutputValue = (nextValues: SelectValue[]) => {
      const labeledValues = nextValues.map((selected) => {
        const option = flatOptions.find((item) => item.value === selected);
        return { value: selected, label: option?.label ?? String(selected) };
      });
      if (labelInValue) return mode ? labeledValues : labeledValues[0];
      return mode ? nextValues : (nextValues[0] ?? "");
    };

    const commitValue = (nextValues: SelectValue[]) => {
      const nextOptions = nextValues.map((selected) =>
        flatOptions.find((option) => option.value === selected),
      );
      if (value === undefined) setInnerValue(nextValues);
      onChange?.(
        toOutputValue(nextValues),
        mode ? (nextOptions.filter(Boolean) as SelectOption[]) : nextOptions[0],
      );
    };

    const clearSearch = () => {
      if (!effectiveAutoClear) return;
      if (searchValue === undefined && searchConfig?.searchValue === undefined)
        setInnerSearchValue("");
      effectiveOnSearch?.("");
    };

    const selectOption = (option: SelectOption) => {
      if (option.disabled || option.value === undefined) return;
      const outputValue = labelInValue
        ? { value: option.value, label: option.label }
        : option.value;
      if (mode) {
        if (values.includes(option.value)) {
          commitValue(values.filter((item) => item !== option.value));
          onDeselect?.(outputValue, option);
        } else if (maxCount === undefined || values.length < maxCount) {
          commitValue([...values, option.value]);
          onSelect?.(outputValue, option);
        }
        clearSearch();
        return;
      }
      commitValue([option.value]);
      onSelect?.(outputValue, option);
      floating.changeOpen(false, "menu");
    };

    const addTags = (tokens: string[]) => {
      if (mode !== "tags") return;
      const nextValues = [...values];
      tokens
        .map((token) => token.trim())
        .filter(Boolean)
        .forEach((token) => {
          if (
            !nextValues.includes(token) &&
            (maxCount === undefined || nextValues.length < maxCount)
          )
            nextValues.push(token);
        });
      if (nextValues.length !== values.length) commitValue(nextValues);
      clearSearch();
    };

    const visibleTags =
      maxTagCount === undefined
        ? selectedOptions
        : selectedOptions.slice(0, maxTagCount === "responsive" ? responsiveTagCount : maxTagCount);
    const omittedTags = selectedOptions.slice(visibleTags.length);

    const optionList = (
      <OptionList
        options={visibleOptions}
        values={values}
        activeIndex={activeIndex}
        maxCount={maxCount}
        height={listHeight}
        virtual={virtual}
        optionRender={optionRender}
        selectedIcon={menuItemSelectedIcon}
        onSelect={selectOption}
        onScroll={onPopupScroll}
      />
    );

    return (
      <div className={twMerge("flex w-full flex-col gap-1", className)}>
        {label ? (
          <Label required={required} size={size}>
            {label}
          </Label>
        ) : null}
        <span ref={floating.triggerRef} className="block w-full" {...floating.triggerProps}>
          <button
            ref={buttonRef}
            type="button"
            disabled={disabled}
            className={selectRootVariants({
              size,
              variant,
              status: errorText ? "error" : status,
              disabled,
            })}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={(event) => {
              onInputKeyDown?.(event);
              if (event.defaultPrevented) return;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                if (!floating.isOpen) floating.changeOpen(true);
                else setActiveIndex((index) => Math.min(index + 1, visibleOptions.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
              }
              if (event.key === "Enter" && floating.isOpen && visibleOptions[activeIndex]) {
                event.preventDefault();
                selectOption(visibleOptions[activeIndex]);
              }
            }}
          >
            {prefix ? <span className="flex shrink-0 items-center">{prefix}</span> : null}
            <span
              ref={tagContainerRef}
              className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
            >
              {mode && selectedOptions.length ? (
                <>
                  {visibleTags.map((option) => {
                    const tagLabel =
                      maxTagTextLength && String(option.label).length > maxTagTextLength
                        ? `${String(option.label).slice(0, maxTagTextLength)}...`
                        : option.label;
                    const close = () => {
                      if (option.value === undefined) return;
                      commitValue(values.filter((item) => item !== option.value));
                      onDeselect?.(
                        labelInValue ? { value: option.value, label: option.label } : option.value,
                        option,
                      );
                    };
                    return tagRender ? (
                      <span key={String(option.value)}>
                        {tagRender({
                          label: tagLabel,
                          value: option.value as SelectValue,
                          closable: !disabled,
                          onClose: close,
                        })}
                      </span>
                    ) : (
                      <Chip
                        key={String(option.value)}
                        color="grey"
                        variant="soft-filled"
                        className="h-5 text-[#555]"
                        suffixIcon={
                          <span
                            onClick={(event) => {
                              event.stopPropagation();
                              close();
                            }}
                          >
                            {removeIcon ?? <Icon icon="close" size={12} color="#999" />}
                          </span>
                        }
                      >
                        {tagLabel}
                      </Chip>
                    );
                  })}
                  {omittedTags.length ? (
                    <span className="text-xs text-[#777]">
                      {typeof maxTagPlaceholder === "function"
                        ? maxTagPlaceholder(
                            omittedTags.map((option) => ({
                              value: option.value as SelectValue,
                              label: option.label,
                            })),
                          )
                        : (maxTagPlaceholder ?? `+ ${omittedTags.length} ...`)}
                    </span>
                  ) : null}
                </>
              ) : selectedOptions[0] ? (
                <span className="truncate">
                  {labelRender
                    ? labelRender({
                        value: selectedOptions[0].value as SelectValue,
                        label: optionLabelProp
                          ? (selectedOptions[0][optionLabelProp] as ReactNode)
                          : selectedOptions[0].label,
                      })
                    : optionLabelProp
                      ? (selectedOptions[0][optionLabelProp] as ReactNode)
                      : selectedOptions[0].label}
                </span>
              ) : (
                <span className="text-[#999]">{placeholder}</span>
              )}
            </span>
            {mode && maxTagCount === "responsive" && selectedOptions.length ? (
              <span
                ref={tagMeasureRef}
                className="pointer-events-none invisible absolute top-0 left-0 flex items-center gap-1.5 whitespace-nowrap"
              >
                {selectedOptions.map((option) => {
                  const tagLabel =
                    maxTagTextLength && String(option.label).length > maxTagTextLength
                      ? `${String(option.label).slice(0, maxTagTextLength)}...`
                      : option.label;
                  return tagRender ? (
                    <span key={String(option.value)} data-select-measure-tag>
                      {tagRender({
                        label: tagLabel,
                        value: option.value as SelectValue,
                        closable: !disabled,
                        onClose: () => undefined,
                      })}
                    </span>
                  ) : (
                    <Chip
                      key={String(option.value)}
                      data-select-measure-tag
                      color="grey"
                      variant="soft-filled"
                      className="h-5"
                      suffixIcon={removeIcon ?? <Icon icon="close" size={12} />}
                    >
                      {tagLabel}
                    </Chip>
                  );
                })}
                <span data-select-measure-placeholder className="text-xs">
                  {typeof maxTagPlaceholder === "function"
                    ? maxTagPlaceholder(
                        selectedOptions.map((option) => ({
                          value: option.value as SelectValue,
                          label: option.label,
                        })),
                      )
                    : (maxTagPlaceholder ?? `+ ${selectedOptions.length} ...`)}
                </span>
              </span>
            ) : null}
            {loading ? (
              <Icon icon="loading" color="#999" className="animate-spin" />
            ) : allowClear && values.length && !disabled ? (
              <span
                className="cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  commitValue([]);
                  onClear?.();
                }}
              >
                {typeof allowClear === "object" && allowClear.clearIcon ? (
                  allowClear.clearIcon
                ) : (
                  <Icon icon="close" color="#999" />
                )}
              </span>
            ) : (
              (suffixIcon ?? (
                <Icon
                  icon="chevron-down"
                  color="#999"
                  className={twMerge("transition-transform", floating.isOpen && "rotate-180")}
                />
              ))
            )}
          </button>
        </span>
        <ErrorText>{errorText}</ErrorText>
        {floating.isOpen && typeof document !== "undefined"
          ? createPortal(
              <div
                ref={floating.popupRef}
                data-select-popup
                className="fixed overflow-hidden rounded-lg bg-white p-1 font-pretendard text-sm text-[#111] shadow-[0_6px_16px_rgba(0,0,0,0.06),0_3px_6px_-4px_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.03)]"
                style={{
                  left: floating.position?.left ?? 0,
                  top: floating.position?.top ?? 0,
                  zIndex: 1050,
                  visibility: floating.position && triggerWidth > 0 ? "visible" : "hidden",
                  width:
                    typeof popupMatchSelectWidth === "number"
                      ? popupMatchSelectWidth
                      : popupMatchSelectWidth
                        ? triggerWidth
                        : undefined,
                  minWidth: popupMatchSelectWidth === false ? 128 : triggerWidth,
                }}
                {...floating.popupProps}
              >
                {isSearchable ? (
                  <Input
                    autoFocus
                    value={query}
                    placeholder="검색하세요"
                    prefixIcon={searchConfig?.searchIcon ?? <Icon icon="search" color="#999" />}
                    className="mb-1"
                    onEnter={() => {
                      if (mode === "tags" && query.trim()) addTags([query]);
                    }}
                    onKeyDown={onInputKeyDown}
                    onChange={(nextQuery) => {
                      const separators =
                        typeof tokenSeparators === "function"
                          ? tokenSeparators(nextQuery)
                          : tokenSeparators;
                      if (mode && separators?.some((separator) => nextQuery.includes(separator))) {
                        addTags(
                          nextQuery.split(
                            new RegExp(
                              `[${separators.map((separator) => `\\${separator}`).join("")}]`,
                            ),
                          ),
                        );
                        return;
                      }
                      if (searchValue === undefined && searchConfig?.searchValue === undefined)
                        setInnerSearchValue(nextQuery);
                      setActiveIndex(defaultActiveFirstOption ? 0 : -1);
                      effectiveOnSearch?.(nextQuery);
                    }}
                  />
                ) : null}
                {popupRender ? popupRender(optionList) : optionList}
                {!visibleOptions.length && mode !== "tags" ? (
                  <div className="px-3 py-6 text-center text-[#999]">{notFoundContent}</div>
                ) : null}
              </div>,
              document.body,
            )
          : null}
      </div>
    );
  },
);

Select.displayName = "Select";

function OptionList({
  options,
  values,
  activeIndex,
  maxCount,
  height,
  virtual,
  optionRender,
  selectedIcon,
  onSelect,
  onScroll,
}: {
  options: SelectOption[];
  values: SelectValue[];
  activeIndex: number;
  maxCount?: number;
  height: number;
  virtual: boolean;
  optionRender?: SelectProps["optionRender"];
  selectedIcon?: ReactNode;
  onSelect: (option: SelectOption) => void;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const hasGroups = options.some((option) => option.__groupLabel !== undefined);
  const useVirtualList =
    virtual && !hasGroups && options.length > Math.ceil(height / ITEM_HEIGHT) * 3;
  const start = useVirtualList ? Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 3) : 0;
  const count = useVirtualList ? Math.ceil(height / ITEM_HEIGHT) + 6 : options.length;
  const rendered = options.slice(start, start + count);

  return (
    <ScrollFade
      style={{ maxHeight: height }}
      fadeSize={20}
      onScroll={(event) => {
        setScrollTop(event.currentTarget.scrollTop);
        onScroll?.(event);
      }}
    >
      <div
        className="relative"
        style={{ height: useVirtualList ? options.length * ITEM_HEIGHT : undefined }}
      >
        <div
          className="grid gap-0.5"
          style={{ transform: useVirtualList ? `translateY(${start * ITEM_HEIGHT}px)` : undefined }}
        >
          {rendered.map((option, offset) => {
            const index = start + offset;
            const selected = option.value === undefined ? false : values.includes(option.value);
            const countDisabled = !selected && maxCount !== undefined && values.length >= maxCount;
            const disabled = option.disabled || countDisabled;
            return (
              <Fragment key={`${String(option.value)}-${index}`}>
                {option.__groupLabel !== undefined ? (
                  <div className="px-3 pt-2 pb-1 text-xs font-medium text-[#999]">
                    {option.__groupLabel as ReactNode}
                  </div>
                ) : null}
                <button
                  type="button"
                  title={option.title}
                  disabled={disabled}
                  className={twMerge(
                    "flex h-8 w-full cursor-pointer items-center gap-2 rounded px-3 text-left transition-colors",
                    (selected || index === activeIndex) && "bg-[#e6f4ff]",
                    selected && "font-medium text-[#0062df]",
                    !selected && index !== activeIndex && "hover:bg-[#f5f5f5]",
                    disabled && "cursor-not-allowed text-[#bbb] hover:bg-transparent",
                    option.className,
                  )}
                  onClick={() => onSelect(option)}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {optionRender ? optionRender(option, { index }) : option.label}
                  </span>
                  {selected ? (selectedIcon ?? <Icon icon="check" color="#0062df" />) : null}
                </button>
              </Fragment>
            );
          })}
        </div>
      </div>
    </ScrollFade>
  );
}

const selectRootVariants = cva(
  "relative flex w-full cursor-pointer items-center gap-2 rounded border border-solid bg-white px-2.5 text-left font-pretendard font-medium text-[#111] transition-colors hover:border-[#0062df] focus-visible:border-[#0062df] focus-visible:outline-none",
  {
    variants: {
      size: { lg: "min-h-10 text-base", md: "min-h-[30px] text-sm", sm: "min-h-5 text-xs" },
      variant: {
        default: "border-[#ddd]",
        outlined: "border-[#ddd]",
        filled: "border-[#f5f5f5] bg-[#f5f5f5]",
        borderless: "border-transparent",
        underlined: "rounded-none border-x-0 border-t-0 border-b-[#ddd] px-0",
      },
      status: {
        error: "border-[#fe5150]",
        warning: "border-[#faad14]",
      },
      disabled: {
        true: "cursor-not-allowed border-[#ddd] bg-[#f8f8f8] text-[#999] hover:border-[#ddd]",
        false: "",
      },
    },
    defaultVariants: { size: "md", variant: "default", disabled: false },
  },
);
