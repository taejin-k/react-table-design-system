import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Upload } from "./Upload";

describe("Upload", () => {
  it("adds selected files and reports the file list", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Upload beforeUpload={() => false} onChange={onChange}>
        <button>파일 선택</button>
      </Upload>,
    );
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    await userEvent.upload(input, new File(["hello"], "hello.txt", { type: "text/plain" }));
    expect(await screen.findByText("hello.txt")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ name: "hello.txt" }) }),
    );
  });

  it("ignores files when beforeUpload returns LIST_IGNORE", async () => {
    const { container } = render(
      <Upload beforeUpload={() => Upload.LIST_IGNORE}>
        <button>파일 선택</button>
      </Upload>,
    );
    await userEvent.upload(container.querySelector("input")!, new File(["x"], "ignored.txt"));
    await waitFor(() => expect(screen.queryByText("ignored.txt")).not.toBeInTheDocument());
  });

  it("keeps the file while a custom request changes its status", async () => {
    const { container } = render(
      <Upload action="/upload" customRequest={(options) => options.onSuccess({ ok: true })}>
        <button>파일 선택</button>
      </Upload>,
    );
    await userEvent.upload(container.querySelector("input")!, new File(["x"], "saved.txt"));
    expect(await screen.findByText("saved.txt")).toBeInTheDocument();
  });
});
