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
  it("does not scroll a partially visible option into view on mouse hover", () => {
    render(<Select defaultOpen virtual={false} options={options} listHeight={40} />);
    const viewport = document.querySelector<HTMLElement>("[data-select-popup] .overflow-auto")!;
    const second = screen.getByRole("button", { name: "Platform" });
    Object.defineProperty(second, "offsetTop", { configurable: true, value: 34 });
    Object.defineProperty(second, "offsetHeight", { configurable: true, value: 32 });
    fireEvent.mouseEnter(second);
    expect(second).toHaveClass("bg-hover");
    expect(viewport.scrollTop).toBe(0);
  });

  it("keeps keyboard navigation visible in a virtual list and resets after filtering", () => {
    render(
      <Select
        showSearch
        defaultOpen
        listHeight={136}
        options={Array.from({ length: 1000 }, (_, i) => ({ value: i, label: `항목 ${i}` }))}
      />,
    );
    const input = screen.getByRole("textbox");
    const viewport = document.querySelector<HTMLElement>("[data-select-popup] .overflow-auto")!;
    for (let i = 0; i < 30; i++) fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(viewport.scrollTop).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "항목 30" })).toHaveClass("bg-hover");
    fireEvent.change(input, { target: { value: "항목 9" } });
    expect(viewport.scrollTop).toBe(0);
    expect(screen.getByRole("button", { name: "항목 9" })).toHaveClass("bg-hover");
  });

  it.each([undefined, "multiple", "tags"] as const)(
    "moves the single active highlight to the hovered option and selects it with Enter in %s mode",
    async (mode) => {
      const onChange = vi.fn();
      render(<Select mode={mode} showSearch defaultOpen options={options} onChange={onChange} />);
      const first = screen.getByRole("button", { name: "Design" });
      const second = screen.getByRole("button", { name: "Platform" });
      expect(first).toHaveClass("bg-hover");
      await userEvent.hover(second);
      expect(first).not.toHaveClass("bg-hover", "hover:bg-hover");
      expect(second).toHaveClass("bg-hover");
      fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
      expect(onChange).toHaveBeenCalledWith(
        mode ? ["platform"] : "platform",
        mode ? [options[1]] : options[1],
      );
    },
  );

  it("switches between mouse and keyboard highlighting without a stale CSS hover", async () => {
    render(<Select showSearch defaultOpen options={options} />);
    const first = screen.getByRole("button", { name: "Design" });
    const second = screen.getByRole("button", { name: "Platform" });
    const disabled = screen.getByRole("button", { name: "Mobile" });
    const input = screen.getByRole("textbox");
    await userEvent.hover(second);
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(first).toHaveClass("bg-hover");
    expect(second).not.toHaveClass("bg-hover", "hover:bg-hover");
    fireEvent.mouseMove(second);
    expect(first).not.toHaveClass("bg-hover");
    expect(second).toHaveClass("bg-hover");
    fireEvent.mouseEnter(disabled);
    expect(disabled).not.toHaveClass("bg-hover");
    expect(second).toHaveClass("bg-hover");
    fireEvent.change(input, { target: { value: "des" } });
    expect(first).toHaveClass("bg-hover");
  });

  it("preserves selected styling when the pointer moves onto a selected item", async () => {
    render(
      <Select
        mode="multiple"
        showSearch
        defaultOpen
        options={options}
        defaultValue={["platform"]}
      />,
    );
    const first = screen.getByRole("button", { name: "Design" });
    const second = screen.getByRole("button", { name: "Platform" });
    await userEvent.hover(second);
    expect(first).not.toHaveClass("bg-hover");
    expect(second).toHaveClass("bg-selected", "text-primary");
    expect(second).not.toHaveClass("bg-hover");
  });

  it.each([undefined, "multiple", "tags"] as const)(
    "includes all descendants of matching group labels in %s mode",
    (mode) => {
      const groupedOptions = [
        {
          label: "제품 조직",
          options: [
            { label: "Design", value: "design" },
            { label: "Product", value: "product", disabled: true },
          ],
        },
        {
          label: "기술 조직",
          options: [
            {
              label: "개발팀",
              options: [
                { label: "Platform", value: "platform" },
                { label: "Mobile", value: "mobile" },
              ],
            },
          ],
        },
        { options: [{ label: "Other", value: "other" }] },
      ];
      render(<Select mode={mode} showSearch defaultOpen options={groupedOptions} />);
      const input = screen.getByRole("textbox");
      const popup = within(document.querySelector("[data-select-popup]") as HTMLElement);
      const visibleLabels = () => popup.getAllByRole("button").map((el) => el.textContent);
      for (const value of ["제품", "ㅈㅍ", "제푸"]) {
        fireEvent.change(input, { target: { value } });
        expect(visibleLabels()).toEqual(["Design", "Product"]);
        expect(popup.getByRole("button", { name: "Product" })).toBeDisabled();
      }
      for (const value of ["기술", "개발", "ㄱㅂㅌ"]) {
        fireEvent.change(input, { target: { value } });
        expect(visibleLabels()).toEqual(["Platform", "Mobile"]);
      }
      fireEvent.change(input, { target: { value: "Design" } });
      expect(visibleLabels()).toEqual(["Design"]);
      fireEvent.change(input, { target: { value: "조직" } });
      expect(visibleLabels()).toEqual(["Design", "Product", "Platform", "Mobile"]);
      fireEvent.change(input, { target: { value: "없는조직" } });
      expect(popup.queryAllByRole("button")).toHaveLength(0);
      fireEvent.change(input, { target: { value: "" } });
      expect(visibleLabels()).toEqual(["Design", "Product", "Platform", "Mobile", "Other"]);
    },
  );

  it("does not force group matches past a custom filter", () => {
    render(
      <Select
        showSearch
        defaultOpen
        filterOption={(query, option) => String(option.label).includes(query)}
        options={[{ label: "제품 조직", options: [{ label: "Design", value: "design" }] }]}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "제품" } });
    expect(screen.queryByRole("button", { name: "Design" })).not.toBeInTheDocument();
  });

  it("searches composing group labels without exposing search metadata on selection", async () => {
    const onChange = vi.fn();
    render(
      <Select
        showSearch
        defaultOpen
        onChange={onChange}
        options={[{ label: "김민준 팀", options: [{ label: "Design", value: "design" }] }]}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "김믽" } });
    expect(screen.getByRole("button", { name: "Design" })).toBeInTheDocument();
    fireEvent.compositionEnd(input, { data: "믽" });
    expect(screen.queryByRole("button", { name: "Design" })).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: "김민준" } });
    await userEvent.click(screen.getByRole("button", { name: "Design" }));
    expect(onChange).toHaveBeenCalledWith("design", {
      label: "Design",
      value: "design",
      __groupLabel: "김민준 팀",
    });
  });

  it.each([undefined, "multiple", "tags"] as const)(
    "keeps Korean results during IME carryover and stops on composition end in %s mode",
    (mode) => {
      render(
        <Select mode={mode} showSearch defaultOpen options={[{ label: "김민준", value: "kim" }]} />,
      );
      const input = screen.getByRole("textbox");
      const popup = within(document.querySelector("[data-select-popup]") as HTMLElement);
      fireEvent.compositionStart(input);
      for (const value of ["김미", "김민", "김믽", "김민주", "김민준"]) {
        fireEvent.change(input, { target: { value } });
        expect(popup.getByRole("button", { name: "김민준" })).toBeInTheDocument();
      }
      fireEvent.change(input, { target: { value: "김믽" } });
      fireEvent.compositionEnd(input, { data: "믽" });
      expect(popup.queryByRole("button", { name: "김민준" })).not.toBeInTheDocument();
      fireEvent.compositionStart(input);
      expect(popup.getByRole("button", { name: "김민준" })).toBeInTheDocument();
      fireEvent.blur(input);
      expect(popup.queryByRole("button", { name: "김민준" })).not.toBeInTheDocument();
    },
  );

  it("keeps custom filtering unchanged even during composition", () => {
    render(
      <Select
        showSearch
        defaultOpen
        filterOption={(query, option) => String(option.label).includes(query)}
        options={[{ label: "김민준", value: "kim" }]}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "김믽" } });
    expect(screen.queryByRole("button", { name: "김민준" })).not.toBeInTheDocument();
  });

  it("commits the final IME text once after the carried initial becomes a syllable", async () => {
    const onChange = vi.fn();
    render(
      <Select mode="tags" onChange={onChange} options={[{ label: "김민준", value: "kim" }]} />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "김믽" } });
    fireEvent.change(input, { target: { value: "김민준" } });
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229, isComposing: true });
    fireEvent.compositionEnd(input, { data: "준" });
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(onChange).toHaveBeenCalledWith(["kim"], expect.any(Array));
    expect(input).toHaveValue("");
  });

  it.each([undefined, "multiple", "tags"] as const)(
    "uses Korean default search in %s mode without reordering options",
    (mode) => {
      render(
        <Select
          mode={mode}
          showSearch
          defaultOpen
          options={[
            { label: "김민준", value: "kim" },
            { label: "김민지", value: "kim2" },
            { label: "박지호", value: "park" },
          ]}
        />,
      );
      const input = screen.getByRole("textbox");
      const popup = document.querySelector("[data-select-popup]") as HTMLElement;
      for (const query of ["ㄱ", "기", "ㄱㅁ", "ㄱㅁㅈ", "김미"]) {
        fireEvent.change(input, { target: { value: query } });
        expect(
          within(popup)
            .getAllByRole("button")
            .map((button) => button.textContent),
        ).toEqual(["김민준", "김민지"]);
      }
      fireEvent.change(input, { target: { value: "김민주" } });
      expect(
        within(popup)
          .getAllByRole("button")
          .map((button) => button.textContent),
      ).toEqual(["김민준"]);
      fireEvent.change(input, { target: { value: "기민" } });
      expect(within(popup).queryAllByRole("button")).toHaveLength(0);
      fireEvent.change(input, { target: { value: "" } });
      expect(within(popup).getAllByRole("button")).toHaveLength(3);
    },
  );

  it("leaves a custom filter in full control of Korean search", () => {
    const filterOption = vi.fn((input: string, option: { label?: ReactNode }) =>
      String(option.label).includes(input),
    );
    render(
      <Select
        showSearch
        defaultOpen
        filterOption={filterOption}
        options={[{ label: "김민준", value: "kim" }]}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "ㄱ" } });
    expect(screen.queryByRole("button", { name: "김민준" })).not.toBeInTheDocument();
    expect(filterOption).toHaveBeenCalledWith("ㄱ", expect.objectContaining({ value: "kim" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "김" } });
    expect(screen.getByRole("button", { name: "김민준" })).toBeInTheDocument();
  });

  it("honors optionFilterProp and a custom sort with Korean matches", () => {
    render(
      <Select
        showSearch
        defaultOpen
        optionFilterProp="name"
        optionsSort={(a, b) => Number(b.value) - Number(a.value)}
        options={[
          { label: "First", name: "김민준", value: 1 },
          { label: "Second", name: "김민지", value: 2 },
          { label: "김민수", name: "박지호", value: 3 },
        ]}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "ㄱㅁ" } });
    const popup = document.querySelector("[data-select-popup]") as HTMLElement;
    expect(
      within(popup)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Second", "First"]);
  });

  it("selects a Korean match with Enter and still creates an unmatched tag", () => {
    const onChange = vi.fn();
    render(
      <Select mode="tags" onChange={onChange} options={[{ label: "김민준", value: "kim" }]} />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "ㄱㅁㅈ" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["kim"], expect.any(Array));
    fireEvent.change(input, { target: { value: "새이름" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["kim", "새이름"], expect.any(Array));
    expect(input).toHaveValue("");
  });

  it("fills the parent by default and applies a custom width only to the trigger", () => {
    const { container, rerender } = render(<Select options={options} />);

    expect(container.firstElementChild).toHaveClass("w-full");

    rerender(<Select options={options} width={320} />);
    expect(container.firstElementChild).not.toHaveStyle({ width: "320px" });
    expect(screen.getByRole("button").parentElement).toHaveStyle({ width: "320px" });

    rerender(
      <Select options={options} width={240} label="긴 레이블" errorMessage="긴 오류 문구" />,
    );
    const triggerWrapper = screen.getByRole("button").parentElement;
    expect(container.firstElementChild).not.toHaveStyle({ width: "240px" });
    expect(triggerWrapper).toHaveStyle({ width: "240px" });
    expect(triggerWrapper).not.toContainElement(screen.getByText("긴 레이블"));
    expect(triggerWrapper).not.toContainElement(screen.getByText("긴 오류 문구"));
  });

  it("uses the filled background without retaining the white background class", () => {
    render(<Select options={options} variant="filled" />);

    const trigger = screen.getByRole("button", { name: "선택하세요" });
    expect(trigger).toHaveClass("bg-hover");
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

  it("supports bigint option keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const bigintOption = { label: "BigInt", value: 1n };
    render(<Select options={[bigintOption]} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "선택하세요" }));
    await user.click(screen.getByRole("button", { name: "BigInt" }));

    expect(onChange).toHaveBeenCalledWith(1n, bigintOption);
  });

  it("uses an async errorMessage function to validate a changed value", async () => {
    const user = userEvent.setup();
    const getErrorMessage = vi.fn(async (nextValue) =>
      nextValue === "design" ? "Design은 선택할 수 없어요." : "",
    );
    render(<Select options={options} errorMessage={getErrorMessage} />);

    await user.click(screen.getByRole("button", { name: "선택하세요" }));
    await user.click(screen.getByRole("button", { name: "Design" }));

    expect(await screen.findByText("Design은 선택할 수 없어요.")).toBeInTheDocument();
    expect(getErrorMessage).toHaveBeenCalledWith("design");
    expect(screen.getByRole("button", { name: "Design" })).toHaveClass("border-danger");
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

  it("repositions an upward popup before paint when clearing search changes its height", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      const isTrigger = this.hasAttribute("data-wizard-floating-trigger");
      const isPopup = this.hasAttribute("data-select-popup");
      const height = isPopup ? (this.textContent?.includes("검색 결과가 없어요") ? 40 : 200) : 40;
      const top = isTrigger ? 700 : 0;
      return {
        bottom: top + height,
        height,
        left: 0,
        right: 320,
        top,
        width: 320,
        x: 0,
        y: top,
        toJSON: () => ({}),
      };
    });

    render(<Select mode="tags" options={options} defaultOpen />);
    const search = screen.getByRole("textbox");
    const popup = document.querySelector("[data-select-popup]") as HTMLElement;

    fireEvent.change(search, { target: { value: "새 태그" } });
    expect(popup).toHaveStyle({ top: "658px" });

    fireEvent.keyDown(search, { key: "Enter" });
    expect(popup).toHaveStyle({ top: "498px" });
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

    expect(designOption).not.toHaveClass("bg-selected");
    expect(platformOption).toHaveClass("bg-selected", "text-primary");
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

  it.each(["multiple", "tags"] as const)(
    "collapses the empty blurred %s input without animating the placeholder",
    (mode) => {
      render(
        <Select mode={mode} showSearch options={options} defaultValue={["design", "platform"]} />,
      );

      const search = screen.getByRole("textbox");

      expect(search.parentElement?.parentElement).toHaveClass("items-start");
      expect(search).toHaveAttribute("data-select-layout-key", "search");
      expect(search).toHaveClass(
        "h-0",
        "min-w-0",
        "opacity-0",
        "-mt-[5px]",
        "-ml-[5px]",
        "transition-none",
      );
      expect(search).not.toHaveClass("transition-opacity", "duration-200");

      fireEvent.focus(search);

      expect(search).not.toHaveClass("h-0", "min-w-0", "opacity-0", "-mt-[5px]", "-ml-[5px]");
    },
  );

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

  it("uses the disabled token for regular and searchable placeholders", () => {
    const { rerender } = render(<Select options={options} placeholder="선택하세요" />);

    expect(screen.getByText("선택하세요")).toHaveClass("text-disabled");
    expect(screen.getByText("선택하세요")).not.toHaveClass("text-gray");

    rerender(<Select options={options} showSearch placeholder="검색하세요" />);

    expect(screen.getByPlaceholderText("검색하세요")).toHaveClass("placeholder:text-disabled");
    expect(screen.getByPlaceholderText("검색하세요")).not.toHaveClass("placeholder:text-gray");
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
    expect(trigger).toHaveClass("cursor-default", "outline-none", "focus:border-primary");

    await user.click(trigger);

    expect(trigger).not.toHaveFocus();
    expect(document.querySelector("[data-select-popup]")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses the default cursor and does not focus its searchable input by click while read only", async () => {
    const user = userEvent.setup();
    render(<Select options={options} readOnly showSearch />);

    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toHaveClass("cursor-default");
    expect(searchInput.parentElement?.parentElement).toHaveClass("cursor-default");

    await user.click(searchInput);
    expect(searchInput).not.toHaveFocus();
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
        options={[{ label: "활성", value: "active", color: "success" }]}
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
          options={[{ label: "활성", value: "active", color: "success" }]}
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
    expect(clearIcon).toHaveClass("transition-opacity", "duration-200", "hover:opacity-75");
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
