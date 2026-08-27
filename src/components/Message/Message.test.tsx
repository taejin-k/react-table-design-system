import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { message } from "./Message";

describe("message", () => {
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

  it("preserves newlines in its content", async () => {
    act(() => {
      message.info({ content: "첫 줄\n둘째 줄", duration: 0 });
    });

    const content = await screen.findByText(/첫 줄\s+둘째 줄/);
    expect(content).toHaveClass("leading-5", "whitespace-pre-line");
    expect(content.parentElement).toHaveClass("items-start");
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
