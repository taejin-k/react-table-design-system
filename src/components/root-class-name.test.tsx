import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumb } from "./Breadcrumb";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Dropdown } from "./Dropdown";
import { ErrorMessage } from "./ErrorMessage";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { Illustrations } from "./Illustrations";
import { Input } from "./Input";
import { Label } from "./Label";
import { Popover } from "./Popover";
import { Radio } from "./Radio";
import { Segmented } from "./Segmented";
import { Select } from "./Select";
import { Tag } from "./Tag";
import { TextArea } from "./TextArea";
import { Tooltip } from "./Tooltip";
import { Toggle } from "./Toggle";

describe("component root className", () => {
  it.each([
    ["Icon", <Icon className="custom-root" icon="add" />],
    ["Button", <Button className="custom-root">Button</Button>],
    ["Tag", <Tag className="custom-root">Tag</Tag>],
    ["Checkbox", <Checkbox className="custom-root" label="Checkbox" />],
    ["Radio", <Radio className="custom-root" label="Radio" />],
    ["Toggle", <Toggle checked={false} className="custom-root" />],
    ["Label", <Label className="custom-root" label="Label" />],
    ["ErrorMessage", <ErrorMessage className="custom-root" errorMessage="Error" />],
    ["Breadcrumb", <Breadcrumb className="custom-root" items={[{ title: "홈" }]} />],
    ["Input", <Input className="custom-root" />],
    ["TextArea", <TextArea className="custom-root" />],
    [
      "Tooltip",
      <Tooltip className="custom-root" title="도움말">
        <button type="button">대상</button>
      </Tooltip>,
    ],
    ["Illustrations", <Illustrations className="custom-root" />],
    [
      "Popover",
      <Popover className="custom-root" content="내용">
        <button type="button">대상</button>
      </Popover>,
    ],
    [
      "Dropdown",
      <Dropdown className="custom-root" menu={{ items: [{ label: "메뉴", value: "menu" }] }}>
        <button type="button">대상</button>
      </Dropdown>,
    ],
    [
      "Segmented",
      <Segmented
        className="custom-root"
        options={[
          { label: "일간", value: "day" },
          { label: "주간", value: "week" },
        ]}
      />,
    ],
    [
      "Flex",
      <Flex className="custom-root">
        <span>항목</span>
      </Flex>,
    ],
    ["Select", <Select className="custom-root" options={[{ label: "Design", value: "design" }]} />],
  ])("applies className to the %s root", (_name, component) => {
    const { container } = render(component);

    expect(container.firstElementChild).toHaveClass("custom-root");
  });
});
