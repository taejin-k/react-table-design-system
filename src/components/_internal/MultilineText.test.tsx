import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { ColorPicker } from "../ColorPicker/ColorPicker";
import { Drawer } from "../Drawer/Drawer";
import { Dropdown } from "../Dropdown/Dropdown";
import { Menu } from "../Menu/Menu";
import { Modal } from "../Modal/Modal";
import { Select } from "../Select/Select";
import { Table } from "../Table/Table";
import { Tabs } from "../Tabs/Tabs";
import { Upload } from "../Upload/Upload";
import { MultilineText } from "./MultilineText";

const text = "첫 번째 줄\n두 번째 줄";
const exactText = () => screen.getByText(text, { normalizer: (value) => value });
const slots: [string, (slot: ReactNode) => ReactElement][] = [
  ["Select empty message", (slot) => <Select open options={[]} notFoundContent={slot} />],
  [
    "Select group label",
    (slot) => (
      <Select open options={[{ label: slot, options: [{ label: "Option", value: "a" }] }]} />
    ),
  ],
  ["Tabs body", (slot) => <Tabs items={[{ key: "a", label: "Tab", children: slot }]} />],
  [
    "Drawer footer",
    (slot) => (
      <Drawer open footer={slot}>
        Body
      </Drawer>
    ),
  ],
  [
    "Modal footer",
    (slot) => (
      <Modal open footer={() => slot}>
        Body
      </Modal>
    ),
  ],
  ["Upload.Dragger message", (slot) => <Upload.Dragger>{slot}</Upload.Dragger>],
  [
    "ColorPicker preset label",
    (slot) => <ColorPicker open presets={[{ label: slot, colors: ["#123456"] }]} />,
  ],
  [
    "Dropdown group label",
    (slot) => (
      <Dropdown
        open
        menu={{
          items: [
            { value: "g", type: "group", label: slot, children: [{ value: "a", label: "Option" }] },
          ],
        }}
      >
        <button>Open</button>
      </Dropdown>
    ),
  ],
  [
    "Menu group label",
    (slot) => (
      <Menu
        items={[
          { key: "g", type: "group", label: slot, children: [{ key: "a", label: "Option" }] },
        ]}
      />
    ),
  ],
  [
    "Table empty message",
    (slot) => (
      <Table
        columns={[{ title: "Name", dataIndex: "name" }]}
        dataSource={[]}
        locale={{ emptyText: slot }}
        pagination={false}
      />
    ),
  ],
  [
    "Table loading text",
    (slot) => (
      <Table
        columns={[]}
        dataSource={[]}
        loading={{ spinning: true, text: slot }}
        pagination={false}
      />
    ),
  ],
  [
    "Table column title",
    (slot) => (
      <Table columns={[{ title: slot, dataIndex: "name" }]} dataSource={[]} pagination={false} />
    ),
  ],
  [
    "Table cell renderer",
    (slot) => (
      <Table
        columns={[{ title: "Name", dataIndex: "name", render: () => slot }]}
        dataSource={[{ key: "1", name: "Name" }]}
        pagination={false}
      />
    ),
  ],
];

describe("MultilineText", () => {
  it.each(["1".repeat(120), "abcdefghij".repeat(12), "안녕하세요".repeat(24)])(
    "wraps long plain text when requested: %.12s",
    (value) => {
      const { container } = render(<MultilineText wrap>{value}</MultilineText>);
      expect(container.firstElementChild).toHaveClass(
        "min-w-0",
        "max-w-full",
        "[overflow-wrap:anywhere]",
      );
      expect(container.textContent).toBe(value);
    },
  );

  it("does not restyle custom JSX when long-word wrapping is requested", () => {
    const { container } = render(
      <MultilineText wrap>
        <div style={{ whiteSpace: "nowrap" }}>Custom</div>
      </MultilineText>,
    );
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toHaveStyle({ whiteSpace: "nowrap" });
    expect(container.querySelector("span")).toBeNull();
  });
  it.each(["first\nsecond", "first\r\nsecond", "first\n\nsecond"])(
    "preserves explicit newlines: %j",
    (value) => {
      const { container } = render(<MultilineText>{value}</MultilineText>);
      expect(container.firstElementChild).toHaveClass("whitespace-pre-line");
      expect(container.textContent).toBe(value);
    },
  );

  it.each(["single line", "literal \\n", 0, null, false])("does not add markup for %j", (value) => {
    const { container } = render(<MultilineText>{value}</MultilineText>);
    expect(container.children).toHaveLength(0);
  });

  it.each(slots)("preserves newlines in %s", (_name, component) => {
    render(component(text));
    expect(exactText()).toHaveClass("whitespace-pre-line");
  });

  it.each(slots)("leaves custom JSX unchanged in %s", (_name, component) => {
    render(
      component(
        <div data-testid="custom" style={{ whiteSpace: "normal" }}>
          {text}
        </div>,
      ),
    );
    const custom = screen.getByTestId("custom");
    expect(custom).toHaveStyle({ whiteSpace: "normal" });
    expect(custom.closest(".whitespace-pre-line")).toBeNull();
  });

  it("preserves newlines in ordinary Table values without a custom renderer", () => {
    render(
      <Table
        columns={[{ title: "Name", dataIndex: "name" }]}
        dataSource={[{ key: "1", name: text }]}
        pagination={false}
      />,
    );
    expect(exactText()).toHaveClass("whitespace-pre-line");
  });

  it.each(["ellipsis", "virtual"] as const)("preserves single-line Table %s cells", (mode) => {
    render(
      <Table
        columns={[{ title: "Name", dataIndex: "name", ellipsis: mode === "ellipsis" }]}
        dataSource={[{ key: "1", name: text }]}
        virtual={mode === "virtual"}
        scroll={{ y: 200 }}
        pagination={false}
      />,
    );
    expect(exactText().closest(".whitespace-pre-line")).toBeNull();
  });

  it("preserves newlines in Table filter group labels and empty messages", async () => {
    render(
      <Table
        columns={[
          {
            title: "Name",
            dataIndex: "name",
            filterSearch: true,
            filters: [{ label: text, value: "group", children: [{ label: "Option", value: "a" }] }],
          },
        ]}
        dataSource={[]}
        locale={{ filterEmptyText: "결과 없음\n다시 검색해 주세요" }}
        pagination={false}
      />,
    );
    await userEvent.click(document.querySelector("[data-table-filter]")!);
    expect(exactText()).toHaveClass("whitespace-pre-line");
    fireEvent.change(screen.getByPlaceholderText("키워드를 입력해요"), {
      target: { value: "zzzz" },
    });
    expect(
      screen.getByText("결과 없음\n다시 검색해 주세요", { normalizer: (value) => value }),
    ).toHaveClass("whitespace-pre-line");
  });
});
