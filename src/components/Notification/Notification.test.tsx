import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { notification } from "./Notification";

describe("notification", () => {
  afterEach(async () => {
    act(() => notification.destroy());
    await waitFor(() =>
      expect(document.querySelectorAll(".wizard-notification-card")).toHaveLength(0),
    );
  });

  it("opens and updates a keyed notification", async () => {
    render(
      <>
        <button
          onClick={() =>
            notification.open({
              key: "save",
              title: "저장",
              description: "완료",
              duration: 0,
            })
          }
        >
          열기
        </button>
        <button
          onClick={() =>
            notification.open({
              key: "save",
              title: "수정",
              description: "갱신",
              duration: 0,
            })
          }
        >
          수정
        </button>
      </>,
    );
    await userEvent.click(screen.getByText("열기"));
    await userEvent.click(screen.getByText("수정", { selector: "button" }));
    expect(await screen.findByText("갱신")).toBeInTheDocument();
    expect(screen.queryByText("완료")).not.toBeInTheDocument();
  });

  it("updates and destroys a notification with a numeric key", async () => {
    act(() => {
      notification.open({ key: 1, description: "처음", duration: 0 });
      notification.open({ key: 1, description: "변경", duration: 0 });
    });

    expect(await screen.findByText("변경")).toBeInTheDocument();
    expect(screen.queryByText("처음")).not.toBeInTheDocument();

    act(() => notification.destroy(1));
    await waitFor(() => expect(screen.queryByText("변경")).not.toBeInTheDocument());
  });

  it("expands a collapsed stack while hovering", async () => {
    render(
      <button
        onClick={() => {
          for (let index = 1; index <= 4; index += 1) {
            notification.open({
              key: String(index),
              title: `알림 ${index}`,
              description: "내용",
              duration: 10,
              showProgress: true,
            });
          }
        }}
      >
        열기
      </button>,
    );
    await userEvent.click(screen.getByText("열기"));
    await waitFor(() =>
      expect(document.querySelectorAll(".wizard-notification-card")).toHaveLength(4),
    );
    const cards = document.querySelectorAll(".wizard-notification-card");
    expect(document.querySelectorAll(".wizard-notification-stack-hidden")).toHaveLength(1);
    expect(cards[0]).toHaveStyle({ "--wizard-notification-scale": "0.88" });
    expect(cards[3]).toHaveStyle({ "--wizard-notification-scale": "1" });

    fireEvent.mouseEnter(cards[3].parentElement!.parentElement!);

    expect(document.querySelectorAll(".wizard-notification-stack-hidden")).toHaveLength(0);
    cards.forEach((card) => {
      expect(card).toHaveStyle({ "--wizard-notification-scale": "1" });
    });
    document
      .querySelectorAll<HTMLElement>(".wizard-notification-card [style*='animation']")
      .forEach((progress) => {
        expect(progress).toHaveClass("bg-primary");
        expect(progress.style.animationPlayState).toBe("paused");
      });
  });

  it("keeps an expanded stack open during a transient pointer leave", async () => {
    render(
      <button
        onClick={() => {
          for (let index = 1; index <= 4; index += 1) {
            notification.open({
              key: String(index),
              title: `알림 ${index}`,
              description: "내용",
              duration: 0,
            });
          }
        }}
      >
        열기
      </button>,
    );
    await userEvent.click(screen.getByText("열기"));
    await waitFor(() =>
      expect(document.querySelectorAll(".wizard-notification-card")).toHaveLength(4),
    );

    const cards = document.querySelectorAll<HTMLElement>(".wizard-notification-card");
    const list = cards[3].parentElement!.parentElement!;
    fireEvent.mouseEnter(list);
    expect(document.querySelectorAll(".wizard-notification-stack-hidden")).toHaveLength(0);

    fireEvent.mouseLeave(list, { clientX: 100, clientY: 100 });
    cards.forEach((card) => {
      expect(card).toHaveStyle({ "--wizard-notification-scale": "1" });
    });

    fireEvent.mouseEnter(list);
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    expect(document.querySelectorAll(".wizard-notification-stack-hidden")).toHaveLength(0);
    cards.forEach((card) => {
      expect(card).toHaveStyle({ "--wizard-notification-scale": "1" });
    });
  });

  it("uses filled 28px status icons", async () => {
    render(
      <button
        onClick={() =>
          notification.success({
            title: "저장 완료",
            description: "저장했어요.",
            duration: 0,
          })
        }
      >
        열기
      </button>,
    );
    await userEvent.click(screen.getByText("열기"));

    const icon = await waitFor(() => {
      const element = document.querySelector('[data-icon="check-circle-filled"]');
      expect(element).toBeInTheDocument();
      return element;
    });
    expect(icon).toHaveAttribute("width", "28");
    expect(icon).toHaveAttribute("height", "28");
  });

  it("shows a persistent animated loading notification", async () => {
    act(() =>
      notification.loading({
        title: "불러오는 중",
        description: "데이터를 불러오고 있어요.",
      }),
    );

    const icon = await waitFor(() => {
      const element = document.querySelector('[data-icon="loading"]');
      expect(element).toBeInTheDocument();
      return element;
    });
    expect(icon).toHaveAttribute("width", "28");
    expect(icon).toHaveAttribute("height", "28");
    expect(icon).toHaveClass("animate-spin");

    await new Promise((resolve) => window.setTimeout(resolve, 100));
    expect(screen.getByText("데이터를 불러오고 있어요.")).toBeInTheDocument();
  });

  it("anchors top and bottom placements to the viewport", async () => {
    act(() => {
      notification.info({
        key: "top",
        description: "위 알림",
        duration: 0,
      });
      notification.info({
        key: "bottom",
        description: "아래 알림",
        duration: 0,
        placement: "bottomRight",
      });
    });

    await waitFor(() =>
      expect(document.querySelectorAll(".wizard-notification-list")).toHaveLength(2),
    );

    const lists = document.querySelectorAll<HTMLElement>(".wizard-notification-list");
    expect(lists[0]).toHaveStyle({ top: "0px" });
    expect(lists[1]).toHaveStyle({ bottom: "0px" });
  });

  it("keeps right and centered placements aligned while the page scrollbar is locked", async () => {
    act(() => {
      notification.info({
        key: "right",
        description: "오른쪽 알림",
        duration: 0,
      });
      notification.info({
        key: "center",
        description: "가운데 알림",
        duration: 0,
        placement: "top",
      });
    });

    await waitFor(() =>
      expect(document.querySelectorAll(".wizard-notification-list")).toHaveLength(2),
    );

    const lists = document.querySelectorAll<HTMLElement>(".wizard-notification-list");
    expect(lists[0]).toHaveStyle({
      right: "var(--wizard-scrollbar-compensation, 0px)",
    });
    expect(lists[1]).toHaveStyle({
      left: "calc((100% - var(--wizard-scrollbar-compensation, 0px)) / 2)",
    });
  });

  it("uses the shared overlay close button", async () => {
    act(() =>
      notification.info({
        title: "안내",
        description: "내용",
        duration: 0,
      }),
    );

    await waitFor(() =>
      expect(document.querySelector("[data-overlay-close-button]")).toHaveClass(
        "size-7",
        "text-dark-gray",
      ),
    );
  });

  it("preserves newlines in its title and description", async () => {
    act(() =>
      notification.info({
        title: "제목 첫 줄\n제목 둘째 줄",
        description: "내용 첫 줄\n내용 둘째 줄",
        duration: 0,
      }),
    );

    expect(await screen.findByText(/제목 첫 줄\s+제목 둘째 줄/)).toHaveClass("whitespace-pre-wrap");
    expect(screen.getByText(/내용 첫 줄\s+내용 둘째 줄/)).toHaveClass("whitespace-pre-wrap");
    expect(document.querySelector('[data-icon="info-circle-filled"]')?.parentElement).toHaveClass(
      "-mt-0.5",
    );
  });

  it("keeps the newest rapidly opened card fully visible in a collapsed stack", async () => {
    render(
      <button
        onClick={() => {
          for (let index = 1; index <= 4; index += 1) {
            notification.open({
              key: String(index),
              title: `알림 ${index}`,
              description: "내용",
              duration: 0,
            });
          }
        }}
      >
        빠르게 열기
      </button>,
    );
    fireEvent.click(screen.getByText("빠르게 열기"));

    await waitFor(() =>
      expect(document.querySelectorAll(".wizard-notification-card")).toHaveLength(4),
    );

    const cards = document.querySelectorAll<HTMLElement>(".wizard-notification-card");
    expect(cards[0]).toHaveStyle({ top: "24px" });
    expect(cards[1]).toHaveStyle({ top: "16px" });
    expect(cards[2]).toHaveStyle({ top: "8px" });
    expect(cards[3]).toHaveStyle({ top: "0px" });
    expect(cards[3]).toHaveAttribute("data-notification-index", "0");
    expect(cards[3]).not.toHaveClass("wizard-notification-stack-hidden");
    expect(cards[3].style.clipPath).toBe("inset(-48px)");

    document
      .querySelectorAll<HTMLElement>(
        ".wizard-notification-motion-appear, .wizard-notification-motion-enter",
      )
      .forEach((card) => expect(card.style.clipPath).toBe("inset(-48px)"));

    await waitFor(() => expect(cards[0].style.clipPath).toContain("50%"));
  });
});
