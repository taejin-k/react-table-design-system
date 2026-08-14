import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { notification } from "./Notification";

describe("notification", () => {
  it("opens and updates a keyed notification", async () => {
    function Example() {
      const [api, holder] = notification.useNotification();
      return (
        <>
          {holder}
          <button
            onClick={() =>
              api.open({ key: "save", title: "저장", description: "완료", duration: false })
            }
          >
            열기
          </button>
          <button
            onClick={() =>
              api.open({ key: "save", title: "수정", description: "갱신", duration: false })
            }
          >
            수정
          </button>
        </>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByText("열기"));
    await userEvent.click(screen.getByText("수정", { selector: "button" }));
    expect(screen.getByText("갱신")).toBeInTheDocument();
    expect(screen.queryByText("완료")).not.toBeInTheDocument();
  });
});
