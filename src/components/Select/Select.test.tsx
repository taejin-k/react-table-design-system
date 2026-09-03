import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { label: "Design", value: "design" },
  { label: "Platform", value: "platform" },
  { label: "Mobile", value: "mobile", disabled: true },
];

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    bottom: 32,
    height: 32,
    left: 0,
    right: 320,
    top: 0,
    width: 320,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});

afterEach(() => vi.restoreAllMocks());

describe("Select", () => {
  it("fills the parent by default and applies a custom width to the root", () => {
    const { container, rerender } = render(<Select options={options} />);

    expect(container.firstElementChild).toHaveClass("w-full");

    rerender(<Select options={options} width={320} />);
    expect(container.firstElementChild).toHaveStyle({ width: "320px" });

    rerender(<Select options={options} width={240} />);
    expect(container.firstElementChild).toHaveStyle({ width: "240px" });
  });

  it("uses the filled background without retaining the white background class", () => {
    render(<Select options={options} variant="filled" />);

    const trigger = screen.getByRole("button", { name: "선택하세요" });
    expect(trigger).toHaveClass("bg-[#f5f5f5]");
    expect(trigger).not.toHaveClass("bg-white");
  });

  it("selects one option and closes the list", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "선택하세요" }));
    await user.click(screen.getByRole("button", { name: "Design" }));

    expect(onChange).toHaveBeenCalledWith("design", options[0]);
    expect(screen.queryByRole("button", { name: "Platform" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Design" })).toBeInTheDocument();
  });

  it("keeps the popup mounted with the dropdown leave motion after selecting an option", () => {
    render(<Select options={options} />);

    fireEvent.click(screen.getByRole("button", { name: "선택하세요" }));
    fireEvent.click(screen.getByRole("button", { name: "Design" }));

    expect(document.querySelector("[data-select-popup]")).toBeInTheDocument();
    expect(document.querySelector("[data-select-motion]")).toHaveStyle({
      opacity: "0",
      transform: "scaleY(0.8)",
      transitionDuration: "200ms",
    });
  });

  it("uses the requested placement for the first dropdown motion frame", () => {
    render(<Select options={options} placement="bottomLeft" defaultOpen />);

    expect(document.querySelector("[data-select-motion]")).toHaveStyle({
      opacity: "0",
      transform: "scaleY(0.8)",
      transformOrigin: "center top",
      transitionDuration: "200ms",
    });
  });

  it("closes with the leave motion when an outer scroll container scrolls", () => {
    const onOpenChange = vi.fn();
    render(<Select options={options} defaultOpen onOpenChange={onOpenChange} />);

    fireEvent.scroll(window);

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.querySelector("[data-select-motion]")).toHaveStyle({ opacity: "0" });
  });

  it("stays open while its own option list scrolls", () => {
    const onOpenChange = vi.fn();
    render(<Select options={options} defaultOpen onOpenChange={onOpenChange} />);

    const popup = document.querySelector("[data-select-popup]") as HTMLElement;
    const optionList = popup.querySelector("[data-scroll-fade]") ?? popup.firstElementChild;
    fireEvent.scroll(optionList as Element);

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(popup).toBeInTheDocument();
  });

  it("uses the selected color only for selected options", async () => {
    const user = userEvent.setup();
    render(<Select options={options} defaultValue="platform" />);

    await user.click(screen.getByRole("button", { name: "Platform" }));

    const popup = document.querySelector("[data-select-popup]") as HTMLElement;
    const designOption = within(popup).getByRole("button", { name: "Design" });
    const platformOption = within(popup).getByRole("button", { name: "Platform" });

    expect(designOption).not.toHaveClass("bg-[#e6f4ff]");
    expect(platformOption).toHaveClass("bg-[#e6f4ff]", "text-primary");
  });

  it("searches and selects multiple options", async () => {
    const user = userEvent.setup();
    render(<Select mode="multiple" options={options} showSearch />);

    const search = screen.getByRole("textbox");
    await user.type(search, "plat");

    const popup = document.querySelector("[data-select-popup]");
    expect(popup).not.toBeNull();
    expect(within(popup as HTMLElement).queryByRole("button", { name: "Design" })).toBeNull();
    await user.click(within(popup as HTMLElement).getByRole("button", { name: "Platform" }));
    expect(screen.getAllByText("Platform")).toHaveLength(2);
    expect(document.querySelector("[data-select-popup]")).toBeInTheDocument();
  });

  it.each(["multiple", "tags"] as const)(
    "shows the placeholder only while %s mode has no selected tags",
    (mode) => {
      const { rerender } = render(
        <Select mode={mode} options={options} placeholder="구성원을 선택하세요" value={[]} />,
      );

      if (mode === "tags") {
        expect(screen.getByPlaceholderText("구성원을 선택하세요")).toBeInTheDocument();
      } else {
        expect(screen.getByText("구성원을 선택하세요")).toBeInTheDocument();
      }

      rerender(
        <Select
          mode={mode}
          options={options}
          placeholder="구성원을 선택하세요"
          value={["design"]}
        />,
      );

      expect(screen.queryByText("구성원을 선택하세요")).toBeNull();
    },
  );

  it("keeps responsive tags on a single row", () => {
    render(
      <Select
        mode="tags"
        options={options}
        defaultValue={["design", "platform"]}
        maxVisibleTagCount="responsive"
      />,
    );

    const search = screen.getByRole("textbox");
    const tagContainer = search.parentElement;
    const trigger = tagContainer?.parentElement;

    expect(tagContainer).toHaveClass("flex-nowrap", "overflow-hidden");
    expect(trigger).toHaveClass("overflow-hidden");
  });

  it("contains a responsive tag search without expanding the select width", () => {
    const { container } = render(
      <Select
        mode="tags"
        options={options}
        defaultValue={["design", "platform"]}
        maxVisibleTagCount="responsive"
      />,
    );

    const search = screen.getByRole("textbox");

    expect(container.firstElementChild).toHaveClass("min-w-0", "w-full", "max-w-full");
    expect(search).toHaveClass("w-0", "max-w-full", "flex-1", "h-0", "opacity-0");

    fireEvent.change(search, {
      target: { value: "부모 너비보다 길어져도 Select를 늘리지 않는 태그 입력값" },
    });

    expect(search).toHaveValue("부모 너비보다 길어져도 Select를 늘리지 않는 태그 입력값");
    expect(search).toHaveClass("flex-1");
    expect(search).not.toHaveClass("h-0", "opacity-0");
  });

  it.each([
    ["lg", "h-8"],
    ["md", "h-[22px]"],
    ["sm", "h-4"],
  ] as const)("restores the %s search row height while typing", (size, height) => {
    render(
      <Select mode="tags" size={size} options={options} defaultValue={["design", "platform"]} />,
    );

    const search = screen.getByRole("textbox");
    const selectedTag = document.querySelector("[data-select-tag]");

    expect(search).toHaveClass("h-0");
    expect(selectedTag).toHaveClass(height);

    fireEvent.focus(search);

    expect(search).toHaveClass(height);
    expect(search).not.toHaveClass("h-0", "opacity-0");

    fireEvent.change(search, { target: { value: "새 태그" } });

    expect(search).toHaveClass(height);
    expect(search).not.toHaveClass("h-0", "opacity-0");
  });

  it("shrinks only the close icon socket in an sm selected tag", () => {
    render(<Select mode="multiple" size="sm" options={options} defaultValue={["design"]} />);

    const selectedTag = document.querySelector<HTMLElement>("[data-select-tag]")!;
    const label = selectedTag.querySelector("span:not([data-tag-icon])");
    const icon = selectedTag.querySelector("[data-tag-icon]");

    expect(selectedTag).toHaveClass("min-h-0", "gap-0.5");
    expect(selectedTag.className).toContain("[&>[data-tag-icon]]:size-3");
    expect(label).toHaveTextContent("Design");
    expect(label).not.toHaveAttribute("data-tag-icon");
    expect(icon).toHaveAttribute("data-tag-icon");
  });

  it("selects the active matching option with Enter in tags mode", async () => {
    const user = userEvent.setup();
    render(<Select mode="tags" options={[{ label: "김민준", value: "kim" }]} />);

    const search = screen.getByRole("textbox");
    await user.type(search, "김민{Enter}");

    expect(screen.getAllByText("김민준")).toHaveLength(2);
    expect(search).toHaveValue("");
  });

  it("shows the empty message when a tags search has no matching option", async () => {
    const user = userEvent.setup();
    render(
      <Select
        mode="tags"
        options={[{ label: "김민준", value: "kim" }]}
        notFoundContent="검색 결과가 없습니다"
      />,
    );

    await user.type(screen.getByRole("textbox"), "없는 구성원");

    expect(screen.getByText("검색 결과가 없습니다")).toBeInTheDocument();
  });

  it("keeps a newly created tag in the option list", async () => {
    const user = userEvent.setup();
    render(<Select mode="tags" options={[]} />);

    const search = screen.getByRole("textbox");
    await user.type(search, "새 구성원{Enter}");

    const popup = document.querySelector("[data-select-popup]");
    expect(popup).not.toBeNull();
    await waitFor(() =>
      expect(within(popup as HTMLElement).getByRole("button", { name: "새 구성원" })).toBeVisible(),
    );
  });

  it("commits each Korean composition without carrying it into the next input", async () => {
    render(
      <Select
        mode="tags"
        options={[
          { label: "김민준", value: "kim" },
          { label: "이서연", value: "lee" },
        ]}
      />,
    );

    const search = screen.getByRole("textbox");
    fireEvent.compositionStart(search);
    fireEvent.change(search, { target: { value: "김민" } });
    fireEvent.keyDown(search, { key: "Enter", keyCode: 229, isComposing: true });
    fireEvent.compositionEnd(search, { data: "김민" });

    await waitFor(() => {
      expect(screen.getAllByText("김민준")).toHaveLength(2);
      expect(search).toHaveValue("");
    });

    fireEvent.compositionStart(search);
    fireEvent.change(search, { target: { value: "이서" } });
    fireEvent.keyDown(search, { key: "Enter", keyCode: 229, isComposing: true });
    fireEvent.compositionEnd(search, { data: "이서" });

    await waitFor(() => {
      expect(screen.getAllByText("이서연")).toHaveLength(2);
      expect(search).toHaveValue("");
    });
    expect(screen.getAllByText("김민준")).toHaveLength(2);
  });

  it("keeps tag padding separate from the same-line search input", () => {
    const { rerender } = render(<Select mode="multiple" showSearch options={options} />);

    expect(screen.getByRole("textbox").closest("div")).not.toHaveClass("pl-[3px]");
    expect(screen.getByRole("textbox")).not.toHaveClass("pl-[7px]");

    rerender(<Select mode="multiple" showSearch options={options} value={["design"]} />);

    expect(screen.getByRole("textbox").closest("div")).toHaveClass("pl-[3px]");
    expect(screen.getByRole("textbox")).not.toHaveClass("pl-[7px]");

    rerender(<Select mode="multiple" showSearch options={options} size="sm" value={["design"]} />);

    expect(screen.getByRole("textbox").closest("div")).toHaveClass("pl-px");
    expect(screen.getByRole("textbox")).not.toHaveClass("pl-[9px]");
  });

  it("restores the normal text inset when the search input wraps below tags", () => {
    const { rerender } = render(
      <Select mode="multiple" options={options} value={["design"]} searchValue="" showSearch />,
    );

    const tag = document.querySelector<HTMLElement>("[data-select-tag]");
    const search = screen.getByRole("textbox");
    expect(tag).not.toBeNull();

    Object.defineProperties(tag!, {
      offsetHeight: { configurable: true, value: 22 },
      offsetTop: { configurable: true, value: 0 },
    });
    Object.defineProperty(search, "offsetTop", { configurable: true, value: 27 });

    rerender(
      <Select mode="multiple" options={options} value={["design"]} searchValue="검색" showSearch />,
    );

    expect(search).toHaveClass("pl-[7px]");
  });

  it("does not add input padding when a tag precedes it on the second row", () => {
    const { rerender } = render(
      <Select
        mode="multiple"
        showSearch
        options={options}
        value={["design", "platform"]}
        searchValue=""
      />,
    );

    const tags = document.querySelectorAll<HTMLElement>("[data-select-tag]");
    const lastTag = tags[tags.length - 1];
    const search = screen.getByRole("textbox");

    Object.defineProperties(lastTag, {
      offsetHeight: { configurable: true, value: 22 },
      offsetTop: { configurable: true, value: 27 },
    });
    Object.defineProperty(search, "offsetTop", { configurable: true, value: 27 });

    rerender(
      <Select
        mode="multiple"
        showSearch
        options={options}
        value={["design", "platform"]}
        searchValue="검색"
      />,
    );

    expect(search).not.toHaveClass("pl-[7px]");
  });

  it("keeps a long tag search value when the input scrolls", () => {
    render(<Select mode="tags" options={options} defaultValue={["design"]} />);

    const search = screen.getByRole("textbox");
    fireEvent.change(search, {
      target: { value: "Select 너비보다 길어져도 유지되는 새로운 태그 입력값" },
    });
    fireEvent.scroll(search);

    expect(search).toHaveValue("Select 너비보다 길어져도 유지되는 새로운 태그 입력값");
    expect(document.querySelector("[data-select-popup]")).toBeInTheDocument();
  });

  it("keeps a group label when filtering removes its first option", () => {
    render(
      <Select
        showSearch
        options={[
          {
            label: "제품 조직",
            options: [
              { label: "Design", value: "design" },
              { label: "Product", value: "product" },
            ],
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "pro" } });

    expect(screen.getByText("제품 조직")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.queryByText("Design")).not.toBeInTheDocument();
  });

  it("shows a pointer cursor on a removable tag icon", () => {
    render(<Select mode="multiple" options={options} defaultValue={["design"]} />);

    expect(screen.getByText("Design").parentElement?.querySelector("svg")).toHaveClass(
      "cursor-pointer",
      "hover:opacity-75",
    );
  });

  it("hides removable tag icons when closable is false", () => {
    render(<Select closable={false} mode="multiple" options={options} defaultValue={["design"]} />);

    expect(screen.getByText("Design").querySelector("svg")).not.toBeInTheDocument();
  });

  it("disables search by default in multiple mode", async () => {
    const user = userEvent.setup();
    render(<Select mode="multiple" options={options} defaultValue={["design", "platform"]} />);

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();

    await user.click(document.querySelector('[tabindex="0"]') as HTMLElement);
    expect(document.querySelector("[data-select-popup]")).toBeInTheDocument();
  });

  it("enables search by default in tags mode", () => {
    render(<Select mode="tags" options={options} />);

    expect(screen.getByRole("textbox").tagName).toBe("INPUT");
  });

  it("smoothly collapses the empty blurred tags input", () => {
    render(<Select mode="tags" options={options} defaultValue={["design", "platform"]} />);

    const search = screen.getByRole("textbox");

    expect(search.parentElement?.parentElement).toHaveClass("items-start");
    expect(search).toHaveAttribute("data-select-layout-key", "search");
    expect(search).toHaveClass(
      "h-0",
      "min-w-0",
      "opacity-0",
      "-mt-[5px]",
      "-ml-[5px]",
      "transition-opacity",
      "duration-300",
      "ease-[cubic-bezier(0.645,0.045,0.355,1)]",
    );

    fireEvent.focus(search);

    expect(search).not.toHaveClass("h-0", "min-w-0", "opacity-0", "-mt-[5px]", "-ml-[5px]");
  });

  it("renders a newly visible tag at its final position", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const top = this.dataset.selectLayoutKey === "search" ? 24 : 0;
      return {
        bottom: top + 32,
        height: 32,
        left: 0,
        right: 320,
        top,
        width: 320,
        x: 0,
        y: top,
        toJSON: () => ({}),
      };
    });
    const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "animate");
    const animate = vi.fn(
      () =>
        ({
          addEventListener: vi.fn(),
          cancel: vi.fn(),
        }) as unknown as Animation,
    );
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: animate,
    });

    const { rerender } = render(
      <Select mode="tags" options={options} value={["design"]} searchValue="" />,
    );

    rerender(
      <Select mode="tags" options={options} value={["design", "platform"]} searchValue="" />,
    );

    expect(animate).not.toHaveBeenCalled();

    if (originalAnimate) {
      Object.defineProperty(HTMLElement.prototype, "animate", originalAnimate);
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, "animate");
    }
  });

  it("continues an interrupted height animation from its rendered height", () => {
    let trigger: HTMLElement | null = null;
    let naturalHeight = 32;
    let heightAnimationRunning = false;
    let triggerAnimationCount = 0;
    const originalAnimate = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "animate");
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const height =
          this === trigger && heightAnimationRunning ? 48 : this === trigger ? naturalHeight : 32;
        return {
          bottom: height,
          height,
          left: 0,
          right: 320,
          top: 0,
          width: 320,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      });

    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: function (this: HTMLElement) {
        const isTriggerAnimation = this === trigger;
        if (isTriggerAnimation) {
          triggerAnimationCount += 1;
          heightAnimationRunning = true;
        }
        return {
          addEventListener: vi.fn(),
          cancel: vi.fn(() => {
            if (isTriggerAnimation) heightAnimationRunning = false;
          }),
        } as unknown as Animation;
      },
    });

    const { rerender } = render(
      <Select mode="tags" options={options} searchValue="" value={["design"]} />,
    );
    trigger = screen.getByRole("textbox").parentElement?.parentElement as HTMLElement;
    naturalHeight = 64;

    rerender(
      <Select mode="tags" options={options} searchValue="" value={["design", "platform"]} />,
    );
    expect(triggerAnimationCount).toBe(1);

    rerender(
      <Select
        mode="tags"
        options={options}
        searchValue=""
        value={["design", "platform", "mobile"]}
      />,
    );
    expect(triggerAnimationCount).toBe(2);

    getBoundingClientRect.mockRestore();
    if (originalAnimate) {
      Object.defineProperty(HTMLElement.prototype, "animate", originalAnimate);
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, "animate");
    }
  });

  it("keeps the tags search focused while pressing inside the Select", () => {
    render(<Select mode="tags" options={options} defaultValue={["design"]} />);

    const search = screen.getByRole("textbox");
    const selectedTag = screen.getByText("Design");
    search.focus();

    expect(fireEvent.mouseDown(selectedTag)).toBe(false);
    expect(search).toHaveFocus();
  });

  it("keeps the multiple search focused while selecting a popup option", () => {
    render(<Select mode="multiple" showSearch options={options} defaultValue={["design"]} />);

    const search = screen.getByRole("textbox");
    fireEvent.focus(search);
    fireEvent.click(search);

    const option = screen.getByRole("button", { name: "Platform" });
    expect(fireEvent.mouseDown(option)).toBe(false);
    fireEvent.click(option);

    expect(search).toHaveFocus();
    expect(screen.getAllByText("Platform")).toHaveLength(2);
  });

  it("removes the last tag with Backspace when the search input is empty", () => {
    const onChange = vi.fn();
    const onDeselect = vi.fn();
    render(
      <Select
        mode="multiple"
        showSearch
        options={options}
        defaultValue={["design", "platform"]}
        onChange={onChange}
        onDeselect={onDeselect}
      />,
    );

    const search = screen.getByRole("textbox");
    fireEvent.keyDown(search, { key: "Backspace" });

    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.queryByText("Platform")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(["design"], [options[0]]);
    expect(onDeselect).toHaveBeenCalledWith("platform", options[1]);
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Select options={options} disabled />);
    await user.click(screen.getByRole("button", { name: "선택하세요" }));
    expect(document.querySelector("[data-select-popup]")).not.toBeInTheDocument();
  });

  it("blocks opening and value changes while loading", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select options={options} loading allowClear defaultValue="design" onChange={onChange} />,
    );

    const trigger = screen.getByRole("button", { name: "Design" });
    expect(trigger).toBeDisabled();

    await user.click(trigger);

    expect(document.querySelector("[data-select-popup]")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("blocks search input while loading", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<Select options={options} loading showSearch onSearch={onSearch} />);

    const search = screen.getByRole("textbox");
    expect(search).toBeDisabled();

    await user.type(search, "Design");

    expect(search).toHaveValue("");
    expect(document.querySelector("[data-select-popup]")).not.toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("keeps its value visible without opening while read only", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} readOnly defaultValue="design" onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: "Design" });
    expect(trigger).not.toBeDisabled();
    expect(trigger).toHaveClass("focus:border-primary", "focus:outline-none");

    await user.click(trigger);

    expect(document.querySelector("[data-select-popup]")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("measures the trigger width when initially controlled open", () => {
    render(<Select options={[]} open />);

    expect(document.querySelector<HTMLElement>("[data-select-popup]")).toHaveStyle({
      visibility: "visible",
      width: "320px",
      minWidth: "320px",
    });
  });

  it("creates tags with tag separators and respects maxSelectedCount", async () => {
    const user = userEvent.setup();
    render(<Select mode="tags" options={[]} tagSeparators={[","]} maxSelectedCount={2} />);

    const search = screen.getByRole("textbox");
    await user.type(search, "Design,Platform,Growth,");

    expect(screen.getAllByText("Design")).toHaveLength(2);
    expect(screen.getAllByText("Platform")).toHaveLength(2);
    expect(screen.queryByText("Growth")).not.toBeInTheDocument();
  });

  it("treats a multi-character tag separator as one separator", async () => {
    const user = userEvent.setup();
    render(<Select mode="tags" options={[]} tagSeparators={["::"]} />);

    const search = screen.getByRole("textbox");
    await user.type(search, "Design:Platform::");

    expect(screen.getAllByText("Design:Platform")).toHaveLength(2);
    expect(screen.queryByText("Design")).not.toBeInTheDocument();
    expect(screen.queryByText("Platform")).not.toBeInTheDocument();
  });

  it("uses optionLabelProp for the selected label", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const labeledOptions = [
      { label: "Design organization", shortLabel: "Design", value: "design" },
    ];
    render(
      <Select
        options={labeledOptions}
        showSearch
        optionLabelProp="shortLabel"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("textbox"));
    await user.click(screen.getByRole("button", { name: "Design organization" }));

    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Design");
    expect(onChange).toHaveBeenCalledWith("design", labeledOptions[0]);
  });

  it("uses filterOption to customize search matching", async () => {
    const user = userEvent.setup();
    const searchableOptions = [
      {
        label: "김민준 · Design",
        value: "kim",
      },
      {
        label: "이서연 · Platform",
        value: "lee",
      },
    ];

    render(
      <Select
        options={searchableOptions}
        showSearch
        filterOption={(inputValue, option) =>
          String(option.label ?? "")
            .toLowerCase()
            .includes(inputValue.toLowerCase())
        }
      />,
    );

    await user.type(screen.getByRole("textbox"), "Platform");

    const popup = document.querySelector("[data-select-popup]") as HTMLElement;
    expect(within(popup).getByRole("button", { name: "이서연 · Platform" })).toBeInTheDocument();
    expect(within(popup).queryByRole("button", { name: "김민준 · Design" })).toBeNull();
  });

  it("accepts a filterOption callback without parameters", async () => {
    const user = userEvent.setup();
    render(<Select options={options} showSearch filterOption={() => true} />);

    await user.type(screen.getByRole("textbox"), "not-matched");

    const popup = document.querySelector("[data-select-popup]") as HTMLElement;
    expect(within(popup).getByRole("button", { name: "Design" })).toBeInTheDocument();
    expect(within(popup).getByRole("button", { name: "Platform" })).toBeInTheDocument();
  });

  it("uses the option color for the default tag and the Icon hover for its close action", async () => {
    const user = userEvent.setup();
    render(
      <Select
        mode="multiple"
        options={[{ label: "활성", value: "active", color: "green" }]}
        defaultValue={["active"]}
      />,
    );

    const tag = document.querySelector<HTMLElement>("[data-select-tag]");
    expect(tag).not.toBeNull();
    expect(tag).toHaveClass("bg-[#eff5ee]", "text-success");

    const closeIcon = (tag as HTMLElement).querySelector("svg") as SVGSVGElement;
    expect(closeIcon).toHaveClass("cursor-pointer", "hover:opacity-75");
    expect(closeIcon.querySelector("path")).toHaveAttribute("fill", "currentColor");

    await user.click(closeIcon);
    expect(document.querySelector("[data-select-tag]")).toBeNull();
  });

  it.each(["multiple", "tags"] as const)(
    "only changes the tag background to white in filled %s mode",
    (mode) => {
      render(
        <Select
          mode={mode}
          variant="filled"
          options={[{ label: "활성", value: "active", color: "green" }]}
          defaultValue={["active"]}
        />,
      );

      expect(document.querySelector("[data-select-tag]")).toHaveClass("bg-white", "text-success");
    },
  );

  it("selects the first option on Enter when search opens", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} showSearch onChange={onChange} />);

    const search = screen.getByRole("textbox");
    await user.click(search);
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(options[0].value, options[0]);
  });

  it("skips disabled options during keyboard navigation", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        showSearch
        options={[
          { label: "Disabled first", value: "disabled", disabled: true },
          { label: "Enabled second", value: "enabled" },
        ]}
        onChange={onChange}
      />,
    );

    const search = screen.getByRole("textbox");
    await user.click(search);
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith("enabled", {
      label: "Enabled second",
      value: "enabled",
    });
  });

  it("opens with ArrowUp and selects the first enabled option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: "선택하세요" });
    trigger.focus();
    await user.keyboard("{ArrowUp}{Enter}");

    expect(onChange).toHaveBeenCalledWith("design", options[0]);
  });

  it("returns undefined when a single selection is cleared", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select allowClear options={options} defaultValue="design" onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: "Design" });
    const clearIcon = trigger.querySelector("svg")?.parentElement;
    expect(clearIcon).not.toBeNull();
    await user.click(clearIcon as HTMLElement);

    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it("passes the empty state through popupRender", () => {
    render(
      <Select
        options={[]}
        defaultOpen
        notFoundContent="검색 결과가 없어요"
        popupRender={(content) => <div data-testid="custom-popup">{content}</div>}
      />,
    );

    expect(screen.getByTestId("custom-popup")).toHaveTextContent("검색 결과가 없어요");
  });

  it("always clears search after a single selection", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<Select options={options} showSearch searchValue="plat" onSearch={onSearch} />);

    await user.click(screen.getByRole("textbox"));
    await user.click(screen.getByRole("button", { name: "Platform" }));

    expect(onSearch).toHaveBeenLastCalledWith("");
  });

  it("truncates selected tags and supports a custom tag renderer", () => {
    const tagRender = vi.fn(({ label }: { label: ReactNode }) => (
      <span data-testid="custom-tag">custom: {label}</span>
    ));
    render(
      <Select
        mode="multiple"
        options={options}
        defaultValue={["platform"]}
        maxTagTextLength={4}
        tagRender={tagRender}
      />,
    );

    expect(screen.getByTestId("custom-tag")).toHaveTextContent("custom: Plat...");
    expect(tagRender).toHaveBeenCalledWith(
      expect.objectContaining({ value: "platform", label: "Plat...", closable: true }),
    );
  });

  it("searches from the select input and renders grouped option labels", async () => {
    const user = userEvent.setup();
    render(
      <Select
        showSearch
        options={[
          { label: "기획", options: [{ label: "Product", value: "product" }] },
          { label: "개발", options: [{ label: "Platform", value: "platform" }] },
        ]}
      />,
    );

    const search = screen.getByRole("textbox");
    await user.click(search);
    const popup = document.querySelector("[data-select-popup]") as HTMLElement;
    expect(within(popup).getByText("기획")).toBeInTheDocument();
    expect(within(popup).getByText("개발")).toBeInTheDocument();
    expect(within(popup).queryByRole("textbox")).not.toBeInTheDocument();

    await user.type(search, "plat");
    expect(within(popup).queryByRole("button", { name: "Product" })).not.toBeInTheDocument();
    expect(within(popup).getByRole("button", { name: "Platform" })).toBeInTheDocument();
  });
});
