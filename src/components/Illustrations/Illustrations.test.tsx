import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Illustrations } from "./Illustrations";
import type { IllustrationType } from "./Illustrations.types";

const illustrationTypes: IllustrationType[] = [
  "list",
  "noResults",
  "error",
  "network",
  "permission",
  "file",
  "notification",
  "message",
  "calendar",
  "chart",
  "comingSoon",
  "completed",
];

describe("Illustrations", () => {
  it("기본으로 검색 결과 없음 이미지와 설명을 표시한다", () => {
    const { container } = render(<Illustrations description="검색 결과가 없어요" />);

    expect(screen.getByText("검색 결과가 없어요")).toBeInTheDocument();
    expect(container.querySelectorAll("circle")).toHaveLength(6);
    expect(container.querySelector("svg")?.parentElement).toHaveClass("size-24");
  });

  it("목록 이미지를 표시하고 최상위 요소에 className을 적용한다", () => {
    const { container } = render(
      <Illustrations className="min-h-80" type="list" description="목록이 없어요" />,
    );

    expect(container.firstElementChild).toHaveClass("min-h-80");
    expect(container.querySelectorAll("circle")).toHaveLength(0);
  });

  it.each([
    ["sm", "size-16", "text-sm"],
    ["md", "size-24", "text-[15px]"],
    ["lg", "size-32", "text-base"],
  ] as const)("%s 크기를 이미지와 설명에 적용한다", (size, expectedClass, descriptionClass) => {
    const { container } = render(<Illustrations size={size} description="안내 문구" />);

    expect(container.querySelector("svg")?.parentElement).toHaveClass(expectedClass);
    expect(screen.getByText("안내 문구")).toHaveClass(descriptionClass);
  });

  it.each(illustrationTypes)("%s 이미지를 표시한다", (type) => {
    const { container } = render(<Illustrations type={type} />);

    expect(container.querySelectorAll('svg[viewBox="0 0 128 128"]')).toHaveLength(1);
  });
});
