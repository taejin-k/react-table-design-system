import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { message } from "../Message";
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
    const customRequest = vi.fn((options) => options.onSuccess({ ok: true }));
    const onChange = vi.fn();
    const { container } = render(
      <Upload action="/upload" customRequest={customRequest} onChange={onChange}>
        <button>파일 선택</button>
      </Upload>,
    );
    await userEvent.upload(container.querySelector("input")!, new File(["x"], "saved.txt"));
    expect(await screen.findByText("saved.txt")).toBeInTheDocument();
    expect(customRequest).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ file: expect.objectContaining({ status: "done" }) }),
      ),
    );
  });

  it("reports request setup failures as an error file", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Upload action={() => Promise.reject(new Error("network"))} onChange={onChange}>
        <button>파일 선택</button>
      </Upload>,
    );

    await userEvent.upload(container.querySelector("input")!, new File(["x"], "failed.txt"));
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ file: expect.objectContaining({ status: "error" }) }),
      ),
    );
  });

  it("filters files with accept before adding them", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Upload accept="image/*" beforeUpload={() => false} onChange={onChange}>
        <button>파일 선택</button>
      </Upload>,
    );
    const input = container.querySelector("input") as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [
          new File(["image"], "photo.png", { type: "image/png" }),
          new File(["text"], "memo.txt", { type: "text/plain" }),
        ],
      },
    });

    expect(await screen.findByText("photo.png")).toBeInTheDocument();
    expect(screen.queryByText("memo.txt")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps only the last selected file when maxCount is one", async () => {
    const { container } = render(
      <Upload multiple maxCount={1} beforeUpload={() => false}>
        <button>파일 선택</button>
      </Upload>,
    );
    const input = container.querySelector("input") as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        files: [new File(["a"], "first.txt"), new File(["b"], "second.txt")],
      },
    });

    expect(await screen.findByText("second.txt")).toBeInTheDocument();
    expect(screen.queryByText("first.txt")).not.toBeInTheDocument();
  });

  it("shows a message when selected files exceed maxCount", async () => {
    const { container } = render(
      <Upload
        multiple
        maxCount={3}
        defaultFileList={[
          { uid: "1", name: "first.txt" },
          { uid: "2", name: "second.txt" },
          { uid: "3", name: "third.txt" },
        ]}
        beforeUpload={() => false}
      >
        <button>파일 선택</button>
      </Upload>,
    );

    fireEvent.change(container.querySelector("input")!, {
      target: { files: [new File(["d"], "fourth.txt")] },
    });

    expect(await screen.findByText("3개까지 등록할 수 있어요.")).toBeInTheDocument();
    expect(screen.queryByText("fourth.txt")).not.toBeInTheDocument();
    message.destroy();
  });

  it("renders a non-interactive filename when the preview icon is hidden", () => {
    const { container } = render(
      <Upload
        defaultFileList={[{ uid: "1", name: "report.pdf", status: "done" }]}
        showUploadList={{ showPreviewIcon: false, showRemoveIcon: false }}
      >
        <button>파일 선택</button>
      </Upload>,
    );

    const list = container.querySelector(".wizard-upload-motion")?.parentElement ?? container;
    expect(within(list).getByText("report.pdf").tagName).toBe("SPAN");
  });

  it("uses a single action overlay without rendering the filename on picture cards", async () => {
    const onPreview = vi.fn();
    const { container } = render(
      <Upload
        listType="picture-card"
        defaultFileList={[
          {
            uid: "image",
            name: "design-system.png",
            status: "done",
            type: "image/png",
            url: "data:image/png;base64,image",
          },
        ]}
        onPreview={onPreview}
      >
        <span>+ 업로드</span>
      </Upload>,
    );

    const item = container.querySelector("[data-upload-picture-item]");
    const actions = container.querySelector("[data-upload-picture-actions]");

    expect(item).toHaveClass("overflow-hidden");
    expect(item).toHaveClass("size-[102px]");
    expect(actions).toHaveClass("bg-black/45", "opacity-0", "group-hover:opacity-100");
    expect(screen.queryByText("design-system.png")).not.toBeInTheDocument();
    expect(item?.compareDocumentPosition(screen.getByText("+ 업로드"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    await userEvent.click(container.querySelector("[data-upload-preview]")!);
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ uid: "image" }));
  });
});
