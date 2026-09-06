import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { message } from "./Message";

describe("message", () => {
  it("keeps the default message card styling", async () => {
    act(() => {
      message.info({ content: "맞춤 메시지", duration: 0 });
    });
    await screen.findByText("맞춤 메시지");
    expect(document.querySelector(".wizard-message-card")).toHaveClass("rounded-lg");
  });
  afterEach(async () => {
    act(() => message.destroy());
    await waitFor(() => expect(document.querySelectorAll(".wizard-message-card")).toHaveLength(0));
  });

  it("opens directly without a context holder", async () => {
    render(
      <button onClick={() => message.success({ content: "저장했어요", duration: 0 })}>열기</button>,
    );
    await userEvent.click(screen.getByText("열기"));
    expect(await screen.findByText("저장했어요")).toBeInTheDocument();
  });

  it("replaces the loading icon immediately without leaving a blue overlay", async () => {
    act(() => void message.loading({ key: "save", content: "저장 중" }));
    await screen.findByText("저장 중");
    const card = document.querySelector(".wizard-message-card")!;
    const loadingIcon = card.querySelector("svg");

    act(() => void message.success({ key: "save", content: "저장 완료", duration: 0 }));
    await screen.findByText("저장 완료");
    expect(document.querySelector(".wizard-message-card")).toBe(card);
    const successPath = card.querySelector('path[fill="var(--color-success)"]')!;
    expect(successPath).toBeInTheDocument();
    expect(successPath.closest("svg")).not.toBe(loadingIcon);
    expect(card.querySelectorAll("svg")).toHaveLength(1);
    expect(card.querySelector('path[fill="var(--color-primary)"]')).not.toBeInTheDocument();
    expect(loadingIcon).not.toBeInTheDocument();
  });

  it("measures the new content width on updates while keeping the same card", async () => {
    let width = 100;
    const measure = vi
      .spyOn(HTMLElement.prototype, "offsetWidth", "get")
      .mockImplementation(function (this: HTMLElement) {
        return this.classList.contains("wizard-message-content") ? width : 0;
      });
    try {
      act(() => void message.info({ key: "width", content: "짧게", duration: 0 }));
      await screen.findByText("짧게");
      const card = document.querySelector(".wizard-message-card")!;
      expect(card).toHaveStyle({ width: "100px" });
      width = 260;
      act(() => void message.success({ key: "width", content: "길어진 메시지 내용", duration: 0 }));
      expect(document.querySelector(".wizard-message-card")).toBe(card);
      expect(card).toHaveStyle({ width: "260px" });
      width = 80;
      act(() => void message.success({ key: "width", content: "완료", duration: 0 }));
      expect(card).toHaveStyle({ width: "80px" });
    } finally {
      measure.mockRestore();
    }
  });

  it("destroys only the message with the matching numeric key", async () => {
    act(() => {
      message.info({ key: 1, content: "첫 메시지", duration: 0 });
      message.info({ key: 2, content: "둘째 메시지", duration: 0 });
    });
    await screen.findByText("첫 메시지");

    act(() => message.destroy(1));

    await waitFor(() => expect(screen.queryByText("첫 메시지")).not.toBeInTheDocument());
    expect(screen.getByText("둘째 메시지")).toBeInTheDocument();
  });

  it("preserves newlines in its content", async () => {
    act(() => {
      message.info({ content: "첫 줄\n둘째 줄", duration: 0 });
    });

    const content = await screen.findByText(/첫 줄\s+둘째 줄/);
    expect(content).toHaveClass(
      "leading-5",
      "whitespace-pre-wrap",
      "[overflow-wrap:anywhere]",
      "break-all",
    );
    expect(content.parentElement).toHaveClass("items-start");
  });

  it("keeps the fixed layer aligned while the page scrollbar is locked", async () => {
    act(() => {
      message.info({ content: "안내", duration: 0 });
    });

    await screen.findByText("안내");
    const fixedLayer = document.querySelector(".wizard-message-list-content")?.parentElement;
    expect(fixedLayer).toHaveStyle({
      right: "var(--wizard-scrollbar-compensation, 0px)",
    });
  });

  it("keeps existing messages above rapidly opened messages", async () => {
    const heightMock = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(40);

    render(
      <button
        onClick={() => {
          for (let index = 1; index <= 3; index += 1) {
            message.info({ key: index, content: `메시지 ${index}`, duration: 0 });
          }
        }}
      >
        빠르게 열기
      </button>,
    );
    fireEvent.click(screen.getByText("빠르게 열기"));

    await waitFor(() => {
      const cards = document.querySelectorAll<HTMLElement>(".wizard-message-card");
      expect(cards[0]).toHaveStyle({ top: "0px" });
      expect(cards[1]).toHaveStyle({ top: "48px" });
      expect(cards[2]).toHaveStyle({ top: "96px" });
    });

    heightMock.mockRestore();
  });
});
