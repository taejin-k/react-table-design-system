import { createPortal } from "react-dom";
import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
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
import { Tag } from "../Tag";
import { ErrorMessage } from "../ErrorMessage";
import { Icon } from "../Icon";
import { Label } from "../Label";
import { ScrollFade } from "../_internal/ScrollFade";
import { getPopupMotionStyle } from "../_internal/motion";
import { useFloatingLayer } from "../_internal/use-floating-layer";
import type { SelectOption, SelectProps, SelectRef } from "./Select.types";

const OPTION_HEIGHT = 32;
const OPTION_GAP = 2;
const ITEM_HEIGHT = OPTION_HEIGHT + OPTION_GAP;
const selectTagSizeClasses = {
  lg: "h-8 text-xs",
  md: "h-[22px]",
  sm: "h-4 min-h-0 gap-0.5 px-1 py-0 text-[10px] leading-4 [&>[data-tag-icon]]:size-3 [&>span:not([data-tag-icon])]:whitespace-nowrap",
} as const;
type SelectLayoutPosition = { left: number; top: number };
type SelectValue = string | number;
type SelectChangeHandler = (
  value: SelectValue | SelectValue[] | undefined,
  option: SelectOption | SelectOption[] | undefined,
) => void;

function flattenOptions(options: SelectOption[]): SelectOption[] {
  return options.flatMap((option) => {
    if (!option.options) return [option];
    return flattenOptions(option.options).map((child) => ({
      ...child,
      __groupLabel: option.label,
    }));
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

function normalizeValue(value: SelectProps["value"] | SelectProps["defaultValue"]) {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

function splitByTagSeparators(value: string, separators: string[]) {
  return separators
    .filter(Boolean)
    .reduce((parts, separator) => parts.flatMap((part) => part.split(separator)), [value]);
}

function isOptionDisabled(option: SelectOption, values: SelectValue[], maxSelectedCount?: number) {
  const selected = option.value !== undefined && values.includes(option.value);
  return Boolean(
    option.disabled ||
    (!selected && maxSelectedCount !== undefined && values.length >= maxSelectedCount),
  );
}

function findEnabledOptionIndex(
  options: SelectOption[],
  values: SelectValue[],
  maxSelectedCount?: number,
) {
  return options.findIndex(
    (option) => option.value !== undefined && !isOptionDisabled(option, values, maxSelectedCount),
  );
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
      width,
      label,
      errorMessage,
      required = false,
      readOnly = false,
      disabled = false,
      allowClear = false,
      showSearch = mode === "tags",
      searchValue,
      filterOption,
      optionsSort,
      optionFilterProp = "label",
      optionLabelProp,
      open,
      defaultOpen = false,
      placement = "bottomLeft",
      notFoundContent = "검색 결과가 없어요",
      listHeight = 256,
      loading = false,
      maxSelectedCount,
      maxVisibleTagCount,
      maxTagTextLength,
      closable = true,
      popupMatchWidth = true,
      tagSeparators,
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
    const normalizedFlatOptions = useMemo(() => flattenOptions(options), [options]);
    const [createdTagOptions, setCreatedTagOptions] = useState<SelectOption[]>([]);
    const flatOptions = useMemo(
      () => [
        ...normalizedFlatOptions,
        ...createdTagOptions.filter(
          (createdOption) =>
            !normalizedFlatOptions.some((option) => option.value === createdOption.value),
        ),
      ],
      [createdTagOptions, normalizedFlatOptions],
    );
    const [innerValue, setInnerValue] = useState<SelectValue[]>(() => normalizeValue(defaultValue));
    const [innerSearchValue, setInnerSearchValue] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [triggerWidth, setTriggerWidth] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const compositeTriggerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const isComposingRef = useRef(false);
    const compositionEnterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tagContainerRef = useRef<HTMLSpanElement>(null);
    const tagMeasureRef = useRef<HTMLSpanElement>(null);
    const [responsiveTagCount, setResponsiveTagCount] = useState(0);
    const [isSearchInputWrapped, setIsSearchInputWrapped] = useState(false);
    const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);
    const previousCompositeHeightRef = useRef<number | null>(null);
    const compositeHeightAnimationRef = useRef<Animation | null>(null);
    const previousLayoutRectsRef = useRef<Map<string, SelectLayoutPosition>>(new Map());
    const layoutAnimationsRef = useRef<Map<string, { element: HTMLElement; animation: Animation }>>(
      new Map(),
    );
    const values = value === undefined ? innerValue : normalizeValue(value);
    const query = searchValue ?? innerSearchValue;
    const isSearchable = Boolean(showSearch);
    const usesCompositeTrigger = isSearchable || Boolean(mode);
    const interactionBlocked = disabled || loading;

    useImperativeHandle(forwardedRef, () => ({
      focus: () =>
        (isSearchable
          ? searchInputRef.current
          : mode
            ? compositeTriggerRef.current
            : buttonRef.current
        )?.focus(),
      blur: () =>
        (isSearchable
          ? searchInputRef.current
          : mode
            ? compositeTriggerRef.current
            : buttonRef.current
        )?.blur(),
    }));

    const selectedOptions = values.map(
      (selected) =>
        flatOptions.find((option) => option.value === selected) ?? {
          label: String(selected),
          value: selected,
        },
    );
    const getSelectedLabel = (option: SelectOption) =>
      optionLabelProp ? ((option[optionLabelProp] as ReactNode) ?? option.label) : option.label;

    const measureResponsiveTags = useCallback(() => {
      if (maxVisibleTagCount !== "responsive") return;
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
      const searchInputWidth = isSearchable ? 32 : 0;
      let usedWidth = 0;
      let nextCount = 0;

      for (let index = 0; index < tagWidths.length; index += 1) {
        const nextWidth = usedWidth + (nextCount ? gap : 0) + tagWidths[index];
        const hasOmittedTags = index < tagWidths.length - 1;
        const reservedWidth =
          (hasOmittedTags ? gap + placeholderWidth : 0) +
          (searchInputWidth ? gap + searchInputWidth : 0);
        if (nextWidth + reservedWidth > availableWidth) break;
        usedWidth = nextWidth;
        nextCount += 1;
      }

      setResponsiveTagCount((current) => (current === nextCount ? current : nextCount));
    }, [isSearchable, maxVisibleTagCount]);

    useLayoutEffect(() => {
      if (maxVisibleTagCount !== "responsive") return;
      measureResponsiveTags();
      const container = tagContainerRef.current;
      if (!container || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measureResponsiveTags);
      observer.observe(container);
      return () => observer.disconnect();
    }, [maxVisibleTagCount, measureResponsiveTags, selectedOptions.length]);

    const getVisibleOptions = useCallback(
      (searchQuery: string) => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
        const filtered = !normalizedQuery
          ? flatOptions
          : flatOptions.filter((option) => {
              if (filterOption) return filterOption(searchQuery, option);
              return optionText(option, optionFilterProp)
                .toLocaleLowerCase()
                .includes(normalizedQuery);
            });
        return optionsSort
          ? [...filtered].sort((a, b) => optionsSort(a, b, { searchValue: searchQuery }))
          : filtered;
      },
      [filterOption, flatOptions, optionFilterProp, optionsSort],
    );

    const visibleOptions = useMemo(() => getVisibleOptions(query), [getVisibleOptions, query]);

    const floating = useFloatingLayer({
      placement,
      trigger: "click",
      disabled: interactionBlocked || readOnly,
      open,
      defaultOpen,
      targetGap: 2,
      onOpenChange: (nextOpen) => {
        if (nextOpen) {
          setTriggerWidth(floating.triggerRef.current?.getBoundingClientRect().width ?? 0);
          const selectedIndex = visibleOptions.findIndex(
            (option) =>
              option.value !== undefined &&
              values.includes(option.value) &&
              !isOptionDisabled(option, values, maxSelectedCount),
          );
          const firstEnabledIndex = findEnabledOptionIndex(
            visibleOptions,
            values,
            maxSelectedCount,
          );
          setActiveIndex(selectedIndex >= 0 ? selectedIndex : Math.max(firstEnabledIndex, 0));
        } else if (searchValue === undefined) {
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
      return mode ? nextValues : nextValues[0];
    };

    const commitValue = (nextValues: SelectValue[]) => {
      if (readOnly || interactionBlocked) return;
      const nextOptions = nextValues.map(
        (selected) =>
          flatOptions.find((option) => option.value === selected) ??
          (mode === "tags" ? { label: String(selected), value: selected } : undefined),
      );
      if (value === undefined) setInnerValue(nextValues);
      const notifyChange = onChange as SelectChangeHandler | undefined;
      notifyChange?.(
        toOutputValue(nextValues),
        mode ? (nextOptions.filter(Boolean) as SelectOption[]) : nextOptions[0],
      );
    };

    const clearSearch = () => {
      if (searchValue === undefined) setInnerSearchValue("");
      onSearch?.("");
    };

    const selectOption = (option: SelectOption) => {
      if (readOnly || interactionBlocked || option.disabled || option.value === undefined) return;
      const outputValue = option.value;
      if (mode) {
        if (values.includes(option.value)) {
          commitValue(values.filter((item) => item !== option.value));
          onDeselect?.(outputValue, option);
        } else if (maxSelectedCount === undefined || values.length < maxSelectedCount) {
          commitValue([...values, option.value]);
          onSelect?.(outputValue, option);
        }
        clearSearch();
        return;
      }
      commitValue([option.value]);
      onSelect?.(outputValue, option);
      clearSearch();
      floating.changeOpen(false, "menu");
    };

    const addTags = (tokens: string[]) => {
      if (mode !== "tags" || interactionBlocked) return;
      const nextValues = [...values];
      const nextTokens = tokens.map((token) => token.trim()).filter(Boolean);
      const addedTokens: string[] = [];
      nextTokens.forEach((token) => {
        if (
          !nextValues.includes(token) &&
          (maxSelectedCount === undefined || nextValues.length < maxSelectedCount)
        ) {
          nextValues.push(token);
          addedTokens.push(token);
        }
      });
      if (addedTokens.length) {
        setCreatedTagOptions((currentOptions) => {
          const knownValues = new Set([
            ...normalizedFlatOptions.map((option) => option.value),
            ...currentOptions.map((option) => option.value),
          ]);
          const newOptions = addedTokens
            .filter((token) => !knownValues.has(token))
            .map((token) => ({ label: token, value: token }));
          return newOptions.length ? [...currentOptions, ...newOptions] : currentOptions;
        });
      }
      if (nextValues.length !== values.length) commitValue(nextValues);
      clearSearch();
    };

    const commitTagQuery = (searchQuery: string, preferredIndex = 0) => {
      if (mode !== "tags" || !searchQuery.trim()) return;
      const matchingOptions = getVisibleOptions(searchQuery);
      const matchingOption = matchingOptions[preferredIndex] ?? matchingOptions[0];
      if (matchingOption) selectOption(matchingOption);
      else addTags([searchQuery]);
    };

    useEffect(
      () => () => {
        if (compositionEnterTimerRef.current !== null)
          clearTimeout(compositionEnterTimerRef.current);
      },
      [],
    );

    const visibleTags =
      maxVisibleTagCount === undefined
        ? selectedOptions
        : selectedOptions.slice(
            0,
            maxVisibleTagCount === "responsive" ? responsiveTagCount : maxVisibleTagCount,
          );
    const omittedTags = selectedOptions.slice(visibleTags.length);

    const measureSearchInputWrap = useCallback(() => {
      const container = tagContainerRef.current;
      const input = searchInputRef.current;
      const tags = container?.querySelectorAll<HTMLElement>("[data-select-tag]");
      const previousTag = tags?.[tags.length - 1];
      const nextWrapped = Boolean(
        input &&
        previousTag &&
        previousTag.offsetHeight > 0 &&
        input.offsetTop >= previousTag.offsetTop + previousTag.offsetHeight,
      );

      setIsSearchInputWrapped((current) => (current === nextWrapped ? current : nextWrapped));
    }, []);

    useLayoutEffect(() => {
      measureSearchInputWrap();
      const container = tagContainerRef.current;
      if (!container || typeof ResizeObserver === "undefined") return;

      const observer = new ResizeObserver(measureSearchInputWrap);
      observer.observe(container);
      return () => observer.disconnect();
    }, [measureSearchInputWrap, query, size, values.length, visibleTags.length]);

    useLayoutEffect(() => {
      if (!mode) {
        previousCompositeHeightRef.current = null;
        compositeHeightAnimationRef.current?.cancel();
        compositeHeightAnimationRef.current = null;
        return;
      }

      const trigger = compositeTriggerRef.current;
      if (!trigger) return;

      const runningAnimation = compositeHeightAnimationRef.current;
      const renderedHeight = runningAnimation ? trigger.getBoundingClientRect().height : null;
      runningAnimation?.cancel();
      compositeHeightAnimationRef.current = null;

      // Canceling the previous animation restores the element's natural height.
      // Measure only after that so rapid tag additions always animate toward the
      // latest flex-wrapped layout instead of an in-between animated height.
      const nextHeight = trigger.getBoundingClientRect().height;
      const previousHeight = previousCompositeHeightRef.current;
      previousCompositeHeightRef.current = nextHeight;

      if (
        previousHeight === null ||
        Math.abs(previousHeight - nextHeight) < 0.5 ||
        typeof trigger.animate !== "function" ||
        (typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      ) {
        return;
      }

      const startHeight = renderedHeight ?? previousHeight;

      const animation = trigger.animate(
        [
          { height: `${startHeight}px`, overflow: "hidden" },
          { height: `${nextHeight}px`, overflow: "hidden" },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.645, 0.045, 0.355, 1)",
        },
      );
      compositeHeightAnimationRef.current = animation;
      animation.addEventListener("finish", () => {
        if (compositeHeightAnimationRef.current === animation) {
          compositeHeightAnimationRef.current = null;
        }
      });
    }, [isSearchInputFocused, mode, selectedOptions.length, size, visibleTags.length]);

    useLayoutEffect(() => {
      if (!mode) {
        previousLayoutRectsRef.current.clear();
        layoutAnimationsRef.current.forEach(({ animation }) => animation.cancel());
        layoutAnimationsRef.current.clear();
        return;
      }

      const container = tagContainerRef.current;
      if (!container) return;

      const elements = Array.from(
        container.querySelectorAll<HTMLElement>("[data-select-layout-key]"),
      );
      const renderedRects = new Map<string, SelectLayoutPosition>();
      const renderedContainerRect = container.getBoundingClientRect();

      layoutAnimationsRef.current.forEach(({ element, animation }, key) => {
        if (element.isConnected) {
          const rect = element.getBoundingClientRect();
          renderedRects.set(key, {
            left: rect.left - renderedContainerRect.left,
            top: rect.top - renderedContainerRect.top,
          });
        }
        animation.cancel();
      });
      layoutAnimationsRef.current.clear();

      const nextRects = new Map<string, SelectLayoutPosition>();
      const nextContainerRect = container.getBoundingClientRect();
      elements.forEach((element) => {
        const key = element.dataset.selectLayoutKey;
        if (key) {
          const rect = element.getBoundingClientRect();
          nextRects.set(key, {
            left: rect.left - nextContainerRect.left,
            top: rect.top - nextContainerRect.top,
          });
        }
      });

      const previousRects = previousLayoutRectsRef.current;
      previousLayoutRectsRef.current = nextRects;
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (previousRects.size === 0 || reducedMotion) return;

      elements.forEach((element) => {
        const key = element.dataset.selectLayoutKey;
        if (key === "search" || key === "omitted") return;
        const nextRect = key ? nextRects.get(key) : undefined;
        const previousRect = key ? (renderedRects.get(key) ?? previousRects.get(key)) : undefined;
        if (!key || !nextRect || !previousRect || typeof element.animate !== "function") return;

        const translateX = previousRect.left - nextRect.left;
        const translateY = previousRect.top - nextRect.top;
        if (Math.abs(translateX) < 0.5 && Math.abs(translateY) < 0.5) return;

        const animation = element.animate(
          [
            { transform: `translate(${translateX}px, ${translateY}px)` },
            { transform: "translate(0, 0)" },
          ],
          {
            duration: 300,
            easing: "cubic-bezier(0.645, 0.045, 0.355, 1)",
          },
        );
        layoutAnimationsRef.current.set(key, { element, animation });
        animation.addEventListener("finish", () => {
          if (layoutAnimationsRef.current.get(key)?.animation === animation) {
            layoutAnimationsRef.current.delete(key);
          }
        });
      });
    }, [isSearchInputFocused, mode, selectedOptions.length, visibleTags.length]);

    useLayoutEffect(() => {
      if (!mode) return;

      const container = tagContainerRef.current;
      if (!container || typeof ResizeObserver === "undefined") return;
      let previousWidth = container.getBoundingClientRect().width;

      const syncLayoutAfterWidthChange = () => {
        const containerRect = container.getBoundingClientRect();
        if (Math.abs(previousWidth - containerRect.width) < 0.5) return;
        previousWidth = containerRect.width;

        layoutAnimationsRef.current.forEach(({ animation }) => animation.cancel());
        layoutAnimationsRef.current.clear();

        const nextRects = new Map<string, SelectLayoutPosition>();
        container.querySelectorAll<HTMLElement>("[data-select-layout-key]").forEach((element) => {
          const key = element.dataset.selectLayoutKey;
          if (!key) return;
          const rect = element.getBoundingClientRect();
          nextRects.set(key, {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
          });
        });
        previousLayoutRectsRef.current = nextRects;
      };

      const observer = new ResizeObserver(syncLayoutAfterWidthChange);
      observer.observe(container);
      return () => observer.disconnect();
    }, [mode]);

    useEffect(
      () => () => {
        compositeHeightAnimationRef.current?.cancel();
        layoutAnimationsRef.current.forEach(({ animation }) => animation.cancel());
      },
      [],
    );

    const optionList = (
      <OptionList
        options={visibleOptions}
        values={values}
        activeIndex={activeIndex}
        maxSelectedCount={maxSelectedCount}
        height={listHeight}
        virtual={virtual}
        optionRender={optionRender}
        onSelect={selectOption}
        onScroll={onPopupScroll}
      />
    );

    const popupContent = visibleOptions.length ? (
      optionList
    ) : (
      <div className="px-3 py-6 text-center text-[#999]">{notFoundContent}</div>
    );

    const updateSearch = (nextQuery: string) => {
      if (interactionBlocked) return;
      const separators =
        typeof tagSeparators === "function" ? tagSeparators(nextQuery) : tagSeparators;
      if (mode && separators?.some((separator) => nextQuery.includes(separator))) {
        addTags(splitByTagSeparators(nextQuery, separators));
        return;
      }
      if (searchValue === undefined) setInnerSearchValue(nextQuery);
      const nextVisibleOptions = getVisibleOptions(nextQuery);
      setActiveIndex(
        Math.max(findEnabledOptionIndex(nextVisibleOptions, values, maxSelectedCount), 0),
      );
      onSearch?.(nextQuery);
      if (!floating.isOpen) floating.changeOpen(true);
    };

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement | HTMLDivElement>,
    ) => {
      if (interactionBlocked) {
        event.preventDefault();
        return;
      }
      onInputKeyDown?.(event);
      if (event.defaultPrevented || readOnly) return;
      const isCompositionEnter =
        event.key === "Enter" &&
        mode === "tags" &&
        (event.nativeEvent.isComposing ||
          isComposingRef.current ||
          (event.nativeEvent as KeyboardEvent).keyCode === 229);
      if (isCompositionEnter) {
        event.preventDefault();
        if (compositionEnterTimerRef.current !== null)
          clearTimeout(compositionEnterTimerRef.current);
        compositionEnterTimerRef.current = setTimeout(() => {
          compositionEnterTimerRef.current = null;
          isComposingRef.current = false;
          commitTagQuery(searchInputRef.current?.value ?? query);
        }, 0);
        return;
      }
      if (event.nativeEvent.isComposing || isComposingRef.current) {
        return;
      }
      if (event.key === "Backspace" && mode && query.length === 0 && values.length > 0) {
        event.preventDefault();
        const removedValue = values[values.length - 1];
        if (removedValue === undefined) return;
        const removedOption = flatOptions.find((option) => option.value === removedValue) ?? {
          value: removedValue,
          label: String(removedValue),
        };
        commitValue(values.slice(0, -1));
        onDeselect?.(removedValue, removedOption);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!floating.isOpen) {
          floating.changeOpen(true);
        } else {
          setActiveIndex((index) => {
            for (let nextIndex = index + 1; nextIndex < visibleOptions.length; nextIndex += 1) {
              const option = visibleOptions[nextIndex];
              if (option.value !== undefined && !isOptionDisabled(option, values, maxSelectedCount))
                return nextIndex;
            }
            return index;
          });
        }
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (!floating.isOpen) {
          floating.changeOpen(true);
        } else {
          setActiveIndex((index) => {
            for (let nextIndex = index - 1; nextIndex >= 0; nextIndex -= 1) {
              const option = visibleOptions[nextIndex];
              if (option.value !== undefined && !isOptionDisabled(option, values, maxSelectedCount))
                return nextIndex;
            }
            return index;
          });
        }
      }
      if (event.key === "Enter") {
        if (compositionEnterTimerRef.current !== null) {
          event.preventDefault();
          return;
        }
        if (mode === "tags" && query.trim()) {
          event.preventDefault();
          commitTagQuery(query, activeIndex);
          return;
        }
        if (floating.isOpen && visibleOptions[activeIndex]) {
          event.preventDefault();
          selectOption(visibleOptions[activeIndex]);
        }
      }
    };

    const singleSelectedLabel = selectedOptions[0]
      ? labelRender
        ? labelRender({
            value: selectedOptions[0].value as SelectValue,
            label: getSelectedLabel(selectedOptions[0]),
          })
        : getSelectedLabel(selectedOptions[0])
      : undefined;

    return (
      <div
        className={twMerge(
          "flex w-full min-w-0 flex-col",
          width === undefined && "max-w-full",
          className,
        )}
        style={{ width }}
      >
        {label ? <Label label={label} required={required} size={size} className="mb-1" /> : null}
        <span
          ref={floating.triggerRef}
          className="block w-full max-w-full min-w-0"
          {...floating.triggerProps}
          onClick={
            usesCompositeTrigger || interactionBlocked ? undefined : floating.triggerProps.onClick
          }
        >
          {usesCompositeTrigger ? (
            <div
              ref={compositeTriggerRef}
              tabIndex={!isSearchable && !interactionBlocked ? 0 : undefined}
              className={twMerge(
                selectRootVariants({
                  size,
                  variant,
                  error: Boolean(errorMessage),
                  readOnly,
                  interactive: !interactionBlocked && !readOnly,
                  disabled,
                }),
                loading && "cursor-default",
                isSearchable
                  ? "cursor-text focus-within:border-[#0062df]"
                  : "cursor-pointer focus:border-[#0062df] focus:outline-none",
                mode &&
                  values.length > 0 && [
                    "items-start",
                    size === "sm" ? "pl-px" : "pl-[3px]",
                    size === "sm" ? "py-px" : "py-[3px]",
                  ],
                maxVisibleTagCount === "responsive" && "overflow-hidden",
              )}
              onMouseDown={(event) => {
                if (isSearchable && event.target !== searchInputRef.current) {
                  event.preventDefault();
                }
              }}
              onClick={() => {
                if (interactionBlocked || readOnly) return;
                if (isSearchable) searchInputRef.current?.focus();
                else compositeTriggerRef.current?.focus();
                floating.changeOpen(true);
              }}
              onFocus={!isSearchable ? (event) => onFocus?.(event) : undefined}
              onBlur={!isSearchable ? (event) => onBlur?.(event) : undefined}
              onKeyDown={!isSearchable ? handleKeyDown : undefined}
            >
              <span
                ref={tagContainerRef}
                className={twMerge(
                  "relative flex min-w-0 flex-1 flex-wrap items-center gap-[5px]",
                  maxVisibleTagCount === "responsive" && "flex-nowrap overflow-hidden",
                )}
              >
                {mode && selectedOptions.length ? (
                  <>
                    {visibleTags.map((option) => {
                      const selectedLabel = getSelectedLabel(option);
                      const tagLabel =
                        maxTagTextLength && String(selectedLabel).length > maxTagTextLength
                          ? `${String(selectedLabel).slice(0, maxTagTextLength)}...`
                          : selectedLabel;
                      const close = () => {
                        if (option.value === undefined) return;
                        commitValue(values.filter((item) => item !== option.value));
                        onDeselect?.(option.value, option);
                      };
                      return tagRender ? (
                        <span
                          key={String(option.value)}
                          data-select-tag
                          data-select-layout-key={`tag:${String(option.value)}`}
                        >
                          {tagRender({
                            label: tagLabel,
                            value: option.value as SelectValue,
                            color: option.color,
                            closable: closable && !interactionBlocked && !readOnly,
                            onClose: close,
                          })}
                        </span>
                      ) : (
                        <Tag
                          key={String(option.value)}
                          data-select-tag
                          data-select-layout-key={`tag:${String(option.value)}`}
                          color={option.color ?? "grey"}
                          variant="filled"
                          className={twMerge(
                            selectTagSizeClasses[size],
                            variant === "filled" && "bg-white",
                          )}
                          suffixIcon={
                            !closable || interactionBlocked || readOnly ? undefined : (
                              <Icon
                                icon="close"
                                size={12}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  close();
                                }}
                              />
                            )
                          }
                        >
                          {tagLabel}
                        </Tag>
                      );
                    })}
                    {omittedTags.length ? (
                      <span
                        data-select-tag
                        data-select-layout-key="omitted"
                        className="text-xs text-[#777]"
                      >
                        + {omittedTags.length} ...
                      </span>
                    ) : null}
                  </>
                ) : null}
                {isSearchable ? (
                  <input
                    ref={searchInputRef}
                    data-select-layout-key="search"
                    disabled={interactionBlocked}
                    readOnly={readOnly}
                    value={query}
                    placeholder={
                      mode && selectedOptions.length > 0
                        ? undefined
                        : !mode && singleSelectedLabel !== undefined
                          ? typeof singleSelectedLabel === "string" ||
                            typeof singleSelectedLabel === "number"
                            ? String(singleSelectedLabel)
                            : undefined
                          : typeof placeholder === "string" || typeof placeholder === "number"
                            ? String(placeholder)
                            : undefined
                    }
                    className={twMerge(
                      "font-inherit w-0 max-w-full min-w-8 flex-1 border-0 bg-transparent p-0 text-inherit opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)] outline-none placeholder:text-[#999] disabled:cursor-not-allowed motion-reduce:transition-none",
                      size === "lg" && "h-8",
                      size === "md" && "h-[22px]",
                      size === "sm" && "h-4",
                      loading && "cursor-default",
                      !mode && singleSelectedLabel !== undefined && "placeholder:text-[#111]",
                      mode &&
                        values.length > 0 &&
                        isSearchInputWrapped &&
                        (size === "sm" ? "pl-[9px]" : "pl-[7px]"),
                      mode &&
                        values.length > 0 &&
                        query.length === 0 && [
                          !isSearchInputFocused && "-mt-[5px] -ml-[5px] h-0 min-w-0 opacity-0",
                        ],
                    )}
                    onFocus={(event) => {
                      setIsSearchInputFocused(true);
                      onFocus?.(event);
                    }}
                    onBlur={(event) => {
                      setIsSearchInputFocused(false);
                      onBlur?.(event);
                    }}
                    onCompositionStart={() => {
                      isComposingRef.current = true;
                      if (compositionEnterTimerRef.current !== null) {
                        clearTimeout(compositionEnterTimerRef.current);
                        compositionEnterTimerRef.current = null;
                      }
                    }}
                    onCompositionEnd={(event) => {
                      isComposingRef.current = false;
                      updateSearch(event.currentTarget.value);
                    }}
                    onKeyDown={handleKeyDown}
                    onChange={(event) => updateSearch(event.currentTarget.value)}
                  />
                ) : selectedOptions.length ? null : (
                  <span className="min-w-0 flex-1 text-left text-[#999]">{placeholder}</span>
                )}
              </span>
              {mode && maxVisibleTagCount === "responsive" && selectedOptions.length ? (
                <span
                  ref={tagMeasureRef}
                  className="pointer-events-none invisible absolute top-0 left-0 flex items-center gap-[5px] whitespace-nowrap"
                >
                  {selectedOptions.map((option) => {
                    const selectedLabel = getSelectedLabel(option);
                    const tagLabel =
                      maxTagTextLength && String(selectedLabel).length > maxTagTextLength
                        ? `${String(selectedLabel).slice(0, maxTagTextLength)}...`
                        : selectedLabel;
                    return tagRender ? (
                      <span key={String(option.value)} data-select-measure-tag>
                        {tagRender({
                          label: tagLabel,
                          value: option.value as SelectValue,
                          color: option.color,
                          closable: closable && !interactionBlocked && !readOnly,
                          onClose: () => undefined,
                        })}
                      </span>
                    ) : (
                      <Tag
                        key={String(option.value)}
                        data-select-measure-tag
                        color={option.color ?? "grey"}
                        variant="filled"
                        className={twMerge(
                          selectTagSizeClasses[size],
                          variant === "filled" && "bg-white",
                        )}
                        suffixIcon={
                          !closable || readOnly ? undefined : <Icon icon="close" size={12} />
                        }
                      >
                        {tagLabel}
                      </Tag>
                    );
                  })}
                  <span data-select-measure-placeholder className="text-xs">
                    + {selectedOptions.length} ...
                  </span>
                </span>
              ) : null}
              {loading ? (
                <Icon icon="loading" color="#999" className="animate-spin self-center" />
              ) : allowClear && values.length && !interactionBlocked && !readOnly ? (
                <span
                  className="cursor-pointer self-center"
                  onClick={(event) => {
                    event.stopPropagation();
                    commitValue([]);
                    onClear?.();
                  }}
                >
                  <Icon icon="close" color="#999" />
                </span>
              ) : (
                <Icon
                  icon="chevron-down"
                  size={14}
                  color="#bbb"
                  className={twMerge(
                    "self-center transition-transform",
                    floating.isOpen && "rotate-180",
                  )}
                />
              )}
            </div>
          ) : (
            <button
              ref={buttonRef}
              type="button"
              disabled={interactionBlocked}
              className={twMerge(
                selectRootVariants({
                  size,
                  variant,
                  error: Boolean(errorMessage),
                  readOnly,
                  interactive: !interactionBlocked && !readOnly,
                  disabled,
                }),
                loading && "cursor-default",
              )}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={handleKeyDown}
            >
              <span className="min-w-0 flex-1 truncate text-left">
                {singleSelectedLabel ?? <span className="text-[#999]">{placeholder}</span>}
              </span>
              {loading ? (
                <Icon icon="loading" color="#999" className="animate-spin" />
              ) : allowClear && values.length && !interactionBlocked && !readOnly ? (
                <span
                  className="cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    commitValue([]);
                    onClear?.();
                  }}
                >
                  <Icon icon="close" color="#999" />
                </span>
              ) : (
                <Icon
                  icon="chevron-down"
                  size={14}
                  color="#bbb"
                  className={twMerge("transition-transform", floating.isOpen && "rotate-180")}
                />
              )}
            </button>
          )}
        </span>
        <ErrorMessage className={errorMessage ? "mt-0.5" : undefined} errorMessage={errorMessage} />
        {floating.isRendered && typeof document !== "undefined"
          ? createPortal(
              <div
                ref={floating.popupRef}
                data-select-popup
                className={twMerge(
                  "fixed font-pretendard text-sm text-[#111]",
                  !floating.isMotionVisible && "pointer-events-none",
                )}
                style={{
                  left: floating.position?.left ?? 0,
                  top: floating.position?.top ?? 0,
                  zIndex: 1050,
                  visibility: floating.position && triggerWidth > 0 ? "visible" : "hidden",
                  width:
                    typeof popupMatchWidth === "number"
                      ? popupMatchWidth
                      : popupMatchWidth
                        ? triggerWidth
                        : undefined,
                  minWidth: popupMatchWidth === false ? 128 : triggerWidth,
                }}
                {...floating.popupProps}
              >
                <div
                  data-select-motion
                  className="overflow-hidden rounded-lg bg-white p-1 shadow-[0_6px_16px_rgba(0,0,0,0.06),0_3px_6px_-4px_rgba(0,0,0,0.08),0_9px_28px_8px_rgba(0,0,0,0.03)] motion-reduce:transition-none"
                  style={getPopupMotionStyle(
                    floating.position?.placement ?? placement,
                    floating.isMotionVisible && Boolean(floating.position),
                  )}
                >
                  {popupRender ? popupRender(popupContent) : popupContent}
                </div>
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
  maxSelectedCount,
  height,
  virtual,
  optionRender,
  onSelect,
  onScroll,
}: {
  options: SelectOption[];
  values: SelectValue[];
  activeIndex: number;
  maxSelectedCount?: number;
  height: number;
  virtual: boolean;
  optionRender?: SelectProps["optionRender"];
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
      fadeSize={48}
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
            const disabled = isOptionDisabled(option, values, maxSelectedCount);
            const previousOption = options[index - 1];
            const startsGroup =
              option.__groupLabel !== undefined &&
              option.__groupLabel !== previousOption?.__groupLabel;
            return (
              <Fragment key={`${String(option.value)}-${index}`}>
                {startsGroup ? (
                  <div className="px-3 pt-2 pb-1 text-xs font-medium text-[#999]">
                    {option.__groupLabel as ReactNode}
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={disabled}
                  className={twMerge(
                    "flex h-8 w-full cursor-pointer items-center gap-2 rounded px-3 text-left transition-colors",
                    selected && "bg-[#e6f4ff]",
                    selected && "font-medium text-[#0062df]",
                    !selected && index === activeIndex && "bg-[#f5f5f5]",
                    !selected && index !== activeIndex && "hover:bg-[#f5f5f5]",
                    disabled && "cursor-not-allowed text-[#bbb] hover:bg-transparent",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(option)}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {optionRender ? optionRender(option, { index }) : option.label}
                  </span>
                  {selected ? <Icon icon="check" color="#0062df" /> : null}
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
  "relative flex w-full cursor-pointer items-center gap-2 rounded border border-solid bg-white px-2.5 text-left font-pretendard font-medium text-[#111] transition-colors focus:border-[#0062df] focus:outline-none",
  {
    variants: {
      size: { lg: "min-h-10 text-base", md: "min-h-[30px] text-sm", sm: "min-h-5 text-xs" },
      variant: {
        default: "border-[#ddd]",
        filled: "border-[#f5f5f5] bg-[#f5f5f5]",
      },
      error: {
        true: "border-[#fe5150]",
        false: "",
      },
      readOnly: {
        true: "cursor-default",
        false: "",
      },
      interactive: {
        true: "hover:border-[#0062df]",
        false: "",
      },
      disabled: {
        true: "cursor-not-allowed border-[#ddd] bg-[#f8f8f8] text-[#999] hover:border-[#ddd]",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      error: false,
      readOnly: false,
      interactive: true,
      disabled: false,
    },
  },
);
