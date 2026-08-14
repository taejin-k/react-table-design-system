import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { message } from "./Message";

describe("message", () => {
  it("opens from the hook api", async () => {
    function Example() {
      const [api, holder] = message.useMessage();
      return (
        <>
          {holder}
          <button onClick={() => api.success({ content: "저장했어요", duration: 0 })}>열기</button>
        </>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByText("열기"));
    expect(screen.getByText("저장했어요")).toBeInTheDocument();
  });
});
