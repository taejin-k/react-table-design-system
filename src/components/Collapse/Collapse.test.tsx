import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Collapse } from "./Collapse";

describe("Collapse", () => {
  it("opens panels and reports active keys", async () => {
    const onChange = vi.fn();
    render(
      <Collapse items={[{ key: "one", label: "제목", children: "내용" }]} onChange={onChange} />,
    );
    await userEvent.click(screen.getByText("제목").closest("[tabindex]")!);
    expect(screen.getByText("내용")).toBeVisible();
    expect(onChange).toHaveBeenCalledWith(["one"]);
  });

  it("keeps one panel open in accordion mode", async () => {
    render(
      <Collapse
        accordion
        defaultActiveKey="one"
        items={[
          { key: "one", label: "하나", children: "1" },
          { key: "two", label: "둘", children: "2" },
        ]}
      />,
    );
    await userEvent.click(screen.getByText("둘").closest("[tabindex]")!);
    expect(screen.getByText("하나").closest("section")?.querySelector(".grid")).toHaveStyle({
      gridTemplateRows: "0fr",
    });
  });
});
