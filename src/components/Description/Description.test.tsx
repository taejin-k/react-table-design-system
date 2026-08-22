import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Description, Descriptions } from "./Description";

describe("Description", () => {
  it("renders item data and spans grid columns", () => {
    render(
      <Description
        bordered
        column={3}
        items={[{ key: "name", label: "이름", children: "태진", span: 2 }]}
      />,
    );
    expect(screen.getByText("태진").parentElement).toHaveStyle({ gridColumn: "span 2" });
  });

  it("supports the Ant Design style Item API and plural alias", () => {
    render(
      <Descriptions>
        <Descriptions.Item label="상태">사용 중</Descriptions.Item>
      </Descriptions>,
    );
    expect(screen.getByText("사용 중")).toBeInTheDocument();
  });
});
