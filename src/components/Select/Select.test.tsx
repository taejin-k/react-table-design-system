import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("searches and selects multiple options", async () => {
    const user = userEvent.setup();
    render(<Select mode="multiple" options={options} />);

    await user.click(screen.getByRole("button", { name: "선택하세요" }));
    await user.type(screen.getByPlaceholderText("검색하세요"), "plat");

    const popup = document.querySelector("[data-select-popup]");
    expect(popup).not.toBeNull();
    expect(within(popup as HTMLElement).queryByRole("button", { name: "Design" })).toBeNull();
    await user.click(within(popup as HTMLElement).getByRole("button", { name: "Platform" }));
    expect(screen.getAllByText("Platform")).toHaveLength(2);
    expect(document.querySelector("[data-select-popup]")).toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Select options={options} disabled />);
    await user.click(screen.getByRole("button", { name: "선택하세요" }));
    expect(document.querySelector("[data-select-popup]")).not.toBeInTheDocument();
  });

  it("measures the trigger width when initially controlled open", () => {
    render(<Select options={[]} open />);

    expect(document.querySelector<HTMLElement>("[data-select-popup]")).toHaveStyle({
      visibility: "visible",
      width: "320px",
      minWidth: "320px",
    });
  });

  it("creates tags with token separators and respects maxCount", async () => {
    const user = userEvent.setup();
    render(<Select mode="tags" options={[]} tokenSeparators={[","]} maxCount={2} />);

    await user.click(screen.getByRole("button", { name: "선택하세요" }));
    const search = screen.getByPlaceholderText("검색하세요");
    await user.type(search, "Design,Platform,Growth,");

    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.queryByText("Growth")).not.toBeInTheDocument();
  });

  it("returns labeled values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} labelInValue onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "선택하세요" }));
    await user.click(screen.getByRole("button", { name: "Design" }));
    expect(onChange).toHaveBeenCalledWith({ value: "design", label: "Design" }, options[0]);
  });

  it("renders grouped option labels and the design-system search input", async () => {
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

    await user.click(screen.getByRole("button", { name: "선택하세요" }));
    const popup = document.querySelector("[data-select-popup]") as HTMLElement;
    expect(within(popup).getByText("기획")).toBeInTheDocument();
    expect(within(popup).getByText("개발")).toBeInTheDocument();
    expect(within(popup).getByPlaceholderText("검색하세요")).toHaveClass("font-pretendard");
  });
});
