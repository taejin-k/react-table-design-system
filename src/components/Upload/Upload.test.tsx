import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { message } from "../Message";
import {
  DOWNLOAD_LOADING_DELAY,
  getSortableUploadItemClassName,
  getSortableUploadItemTransition,
  reorderUploadFiles,
  shouldDisableSortableTextHover,
  Upload,
} from "./Upload";
import type { UploadChangeParam, UploadFile } from "./Upload.types";

describe("Upload", () => {
  it("merges className into the outermost Upload and Upload.Dragger elements", () => {
    const upload = render(
      <Upload className="upload-custom w-fit">
        <button>파일 선택</button>
      </Upload>,
    );

    expect(upload.container.firstElementChild).toHaveClass("upload-custom", "w-fit");
    expect(upload.container.firstElementChild).not.toHaveClass("w-full");

    const dragger = render(<Upload.Dragger className="dragger-custom w-full" />);
    expect(dragger.container.firstElementChild).toHaveClass("dragger-custom", "w-full");
  });

  it("fills the available width so file names and actions stay separated", () => {
    const { container } = render(
      <Upload defaultFileList={[{ uid: "1", name: "report.pdf" }]}>
        <button>파일 선택</button>
      </Upload>,
    );

    expect(container.firstElementChild).toHaveClass("w-full");
    expect(container.querySelector("[data-upload-trigger]")).toHaveClass("w-fit", "self-start");
  });

  it("always opens the native file dialog when its enabled trigger is clicked", async () => {
    const { container } = render(
      <Upload>
        <button>파일 선택</button>
      </Upload>,
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    const inputClick = vi.spyOn(input, "click");

    await userEvent.click(screen.getByRole("button", { name: "파일 선택" }));

    expect(inputClick).toHaveBeenCalledOnce();
  });

  it("renders a Dragger file list below the dashed drop area", () => {
    const { container } = render(
      <Upload.Dragger defaultFileList={[{ uid: "1", name: "design-system.png" }]} />,
    );
    const dropArea = container.querySelector("[data-upload-dragger-area]");
    const listItem = container.querySelector("[data-upload-list-item]");

    expect(dropArea).toBeInTheDocument();
    expect(listItem).toBeInTheDocument();
    expect(dropArea).not.toContainElement(listItem as HTMLElement);
    expect(dropArea?.compareDocumentPosition(listItem as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(screen.getByText("단일 파일만 선택할 수 있어요.")).toBeInTheDocument();
  });

  it("describes multiple selection in the default Dragger content", () => {
    render(<Upload.Dragger multiple />);

    expect(screen.getByText("여러 파일을 선택할 수 있어요.")).toBeInTheDocument();
    expect(screen.queryByText("단일 파일만 선택할 수 있어요.")).not.toBeInTheDocument();
  });

  it("adds only the first dropped file when multiple is false", async () => {
    const onChange = vi.fn();
    const { container } = render(<Upload.Dragger onChange={onChange} />);
    const dropArea = container.querySelector("[data-upload-dragger-area]")!;

    fireEvent.drop(dropArea, {
      dataTransfer: {
        files: [new File(["a"], "first.txt"), new File(["b"], "second.txt")],
      },
    });

    expect(await screen.findByText("first.txt")).toBeInTheDocument();
    expect(screen.queryByText("second.txt")).not.toBeInTheDocument();
    expect(
      await screen.findByText("단일 파일만 선택할 수 있어 첫 번째 파일만 추가했어요."),
    ).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
    message.destroy();
  });

  it("shows drag handles for sortable text and picture lists", () => {
    const files = [
      { uid: "1", name: "first.png" },
      { uid: "2", name: "second.png" },
    ];
    const { container, rerender } = render(
      <Upload draggable listType="text" defaultFileList={files} />,
    );

    const textHandles = container.querySelectorAll("[data-upload-drag-handle]");
    expect(textHandles).toHaveLength(2);
    expect(textHandles[0]).toHaveClass("w-6");

    rerender(<Upload draggable listType="picture" defaultFileList={files} />);
    const pictureHandles = container.querySelectorAll("[data-upload-drag-handle]");
    expect(pictureHandles).toHaveLength(2);
    expect(pictureHandles[0]).toHaveClass("w-4");
    expect(container.querySelector("[data-upload-list-item]")).toHaveClass(
      "bg-white",
      "transition-[background-color]",
    );
    expect(container.querySelector("[data-upload-list-item]")).not.toHaveClass("transition-colors");

    rerender(<Upload listType="picture" defaultFileList={files} />);
    expect(container.querySelector("[data-upload-drag-handle]")).not.toBeInTheDocument();
  });

  it("keeps uploaded rows mounted when disabled and draggable change", () => {
    const files = [{ uid: "1", name: "kept-file.txt" }];
    const { container, rerender } = render(<Upload defaultFileList={files} />);
    const originalRow = screen.getByText("kept-file.txt").closest("[data-upload-list-item]");

    rerender(<Upload defaultFileList={files} disabled />);
    expect(screen.getByText("kept-file.txt").closest("[data-upload-list-item]")).toBe(originalRow);

    rerender(<Upload defaultFileList={files} draggable />);
    expect(screen.getByText("kept-file.txt").closest("[data-upload-list-item]")).toBe(originalRow);
    expect(container.querySelector("[data-upload-drag-handle]")).toBeInTheDocument();

    rerender(<Upload defaultFileList={files} draggable disabled />);
    expect(screen.getByText("kept-file.txt").closest("[data-upload-list-item]")).toBe(originalRow);
    expect(container.querySelector("[data-upload-drag-handle-disabled]")).toHaveAttribute(
      "data-upload-drag-handle-disabled",
      "true",
    );
  });

  it("switches picture actions to the hidden text state without an opacity transition", () => {
    const files = [{ uid: "1", name: "actions.pdf", url: "/actions.pdf" }];
    const { container, rerender } = render(<Upload listType="picture" defaultFileList={files} />);
    const pictureActions = container.querySelector("[data-upload-actions]");

    expect(pictureActions).not.toHaveClass("opacity-0");
    expect(container.querySelector("[data-upload-download-action]")).toBeInTheDocument();
    expect(container.querySelector("[data-upload-remove-action]")).toBeInTheDocument();

    rerender(<Upload listType="text" defaultFileList={files} />);
    const textActions = container.querySelector("[data-upload-actions]");

    expect(textActions).not.toBe(pictureActions);
    expect(textActions).toHaveClass("opacity-0", "transition-opacity");
    expect(container.querySelector("[data-upload-download-action]")).toBeInTheDocument();
    expect(container.querySelector("[data-upload-remove-action]")).toBeInTheDocument();
  });

  it("styles sortable items by list type and disables hover on inactive text rows", () => {
    expect(getSortableUploadItemClassName("text", true)).toContain("z-10");
    expect(getSortableUploadItemClassName("picture", true)).toContain("z-[1000]");
    expect(getSortableUploadItemClassName("picture", true)).toContain(
      "shadow-[0_3px_8px_rgba(0,0,0,0.12)]",
    );
    expect(getSortableUploadItemClassName("picture", false)).toContain("shadow-none");
    expect(getSortableUploadItemTransition("transform 200ms ease")).toBe(
      "transform 200ms ease, box-shadow 180ms ease-out",
    );
    expect(shouldDisableSortableTextHover("text", true, false)).toBe(true);
    expect(shouldDisableSortableTextHover("text", true, true)).toBe(false);
    expect(shouldDisableSortableTextHover("picture", true, false)).toBe(false);
  });

  it.each(["text", "picture"] as const)(
    "keeps the first %s row mounted when the third and second files are removed",
    async (listType) => {
      const { container } = render(
        <Upload
          draggable
          listType={listType}
          defaultFileList={[
            { uid: "1", name: "first.txt" },
            { uid: "2", name: "second.txt" },
            { uid: "3", name: "third.txt" },
          ]}
        />,
      );
      const firstRow = screen.getByText("first.txt").closest("[data-upload-list-item]");

      fireEvent.click(
        screen
          .getByText("third.txt")
          .closest("[data-upload-list-item]")!
          .querySelector("[data-upload-remove-action]")!,
      );
      await waitFor(() => expect(screen.queryByText("third.txt")).not.toBeInTheDocument());

      fireEvent.click(
        screen
          .getByText("second.txt")
          .closest("[data-upload-list-item]")!
          .querySelector("[data-upload-remove-action]")!,
      );
      await waitFor(() => expect(screen.queryByText("second.txt")).not.toBeInTheDocument());

      expect(screen.getByText("first.txt").closest("[data-upload-list-item]")).toBe(firstRow);
      expect(container.querySelector('[data-upload-sortable-item="1"]')).toBeInTheDocument();
    },
  );

  it("shows a fallback thumbnail for non-image files and failed images in picture lists", () => {
    const { container } = render(
      <Upload
        listType="picture"
        defaultFileList={[
          { uid: "pdf", name: "proposal.pdf", type: "application/pdf" },
          {
            uid: "image",
            name: "broken.png",
            type: "image/png",
            url: "/broken.png",
          },
        ]}
      />,
    );

    expect(container.querySelectorAll("[data-upload-picture-fallback]")).toHaveLength(1);
    fireEvent.error(container.querySelector("[data-upload-picture-thumbnail]")!);
    expect(container.querySelectorAll("[data-upload-picture-fallback]")).toHaveLength(2);
  });

  it("shows an uploaded image as the picture thumbnail even when its MIME type is empty", async () => {
    const createObjectUrlMock = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:uploaded-image");
    const { container } = render(
      <Upload listType="picture">
        <button>파일 선택</button>
      </Upload>,
    );

    await userEvent.upload(container.querySelector("input")!, new File(["image"], "photo.png"));

    await waitFor(() =>
      expect(container.querySelector("[data-upload-picture-thumbnail]")).toBeInTheDocument(),
    );
    const thumbnail = container.querySelector("[data-upload-picture-thumbnail]");
    expect(createObjectUrlMock).toHaveBeenCalledWith(expect.any(File));
    expect(thumbnail).toHaveAttribute("src", "blob:uploaded-image");
    expect(thumbnail).toHaveAttribute("draggable", "false");
    expect(container.querySelector("[data-upload-picture-fallback]")).not.toBeInTheDocument();

    fireEvent.load(thumbnail!);
    await userEvent.click(thumbnail!);
    expect(document.querySelector("[data-image-preview-root]")).toBeInTheDocument();
    expect(document.querySelector(".wizard-image-preview-image")).toHaveAttribute(
      "src",
      "blob:uploaded-image",
    );
  });

  it("creates a picture thumbnail for an initial controlled originFileObj", () => {
    const originFileObj = new File(["image"], "controlled.png", { type: "image/png" });
    const createObjectUrlMock = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:controlled-initial-image");
    const { container } = render(
      <Upload
        listType="picture"
        fileList={[
          {
            uid: "controlled-image",
            name: originFileObj.name,
            type: originFileObj.type,
            originFileObj,
          },
        ]}
      />,
    );

    expect(createObjectUrlMock).toHaveBeenCalledWith(originFileObj);
    expect(container.querySelector("[data-upload-picture-thumbnail]")).toHaveAttribute(
      "src",
      "blob:controlled-initial-image",
    );
  });

  it("shows a replacement image immediately when a failed thumbnail source changes", () => {
    const { container, rerender } = render(
      <Upload
        listType="picture"
        fileList={[{ uid: "image", name: "image.png", type: "image/png", url: "/old.png" }]}
      />,
    );
    fireEvent.error(container.querySelector("[data-upload-picture-thumbnail]")!);
    expect(container.querySelector("[data-upload-picture-fallback]")).toBeInTheDocument();

    rerender(
      <Upload
        listType="picture"
        fileList={[{ uid: "image", name: "image.png", type: "image/png", url: "/new.png" }]}
      />,
    );

    expect(container.querySelector("[data-upload-picture-fallback]")).not.toBeInTheDocument();
    expect(container.querySelector("[data-upload-picture-thumbnail]")).toHaveAttribute(
      "src",
      "/new.png",
    );
  });

  it("keeps the picture thumbnail until its removal animation finishes", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:leaving-picture");
    const revokeObjectUrlMock = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const { container } = render(
      <Upload listType="picture">
        <button>파일 선택</button>
      </Upload>,
    );

    await userEvent.upload(
      container.querySelector("input")!,
      new File(["image"], "leaving.png", { type: "image/png" }),
    );
    expect(await screen.findByText("leaving.png")).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector(".wizard-upload-motion-enter-active")).not.toBeInTheDocument(),
    );

    fireEvent.click(container.querySelector("[data-upload-remove-action]")!);

    await waitFor(() =>
      expect(container.querySelector(".wizard-upload-motion-leave-active")).toBeInTheDocument(),
    );
    expect(container.querySelector("[data-upload-picture-thumbnail]")).toHaveAttribute(
      "src",
      "blob:leaving-picture",
    );
    expect(container.querySelector("[data-upload-picture-fallback]")).not.toBeInTheDocument();
    expect(revokeObjectUrlMock).not.toHaveBeenCalledWith("blob:leaving-picture");

    await waitFor(() => expect(screen.queryByText("leaving.png")).not.toBeInTheDocument());
    expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:leaving-picture");
  });

  it("reorders files by their drag identifiers", () => {
    const files = [
      { uid: "1", name: "first.png" },
      { uid: "2", name: "second.png" },
      { uid: "3", name: "third.png" },
    ];

    expect(reorderUploadFiles(files, "1", "3").map((file) => file.uid)).toEqual(["2", "3", "1"]);
  });

  it("adds selected files and reports the file list", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Upload onChange={onChange}>
        <button>파일 선택</button>
      </Upload>,
    );
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    await userEvent.upload(input, new File(["hello"], "hello.txt", { type: "text/plain" }));
    expect(await screen.findByText("hello.txt")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ name: "hello.txt" }) }),
    );
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.lastCall?.[0].file).not.toHaveProperty("status");
    expect(onChange.mock.lastCall?.[0].file).not.toHaveProperty("response");
    expect(onChange.mock.lastCall?.[0].file).not.toHaveProperty("error");
    expect(onChange.mock.lastCall?.[0].file).not.toHaveProperty("thumbUrl");
  });

  it("adds text and picture files reliably when separate upload lists start in quick succession", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:quick-picture");
    const { container } = render(
      <div>
        <Upload listType="text">
          <button>텍스트 파일 선택</button>
        </Upload>
        <Upload listType="picture">
          <button>이미지 파일 선택</button>
        </Upload>
      </div>,
    );
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');

    fireEvent.change(inputs[0], {
      target: { files: [new File(["text"], "notes.txt", { type: "text/plain" })] },
    });
    fireEvent.change(inputs[1], {
      target: { files: [new File(["image"], "photo.png", { type: "image/png" })] },
    });

    expect(await screen.findByText("notes.txt")).toBeInTheDocument();
    expect(await screen.findByText("photo.png")).toBeInTheDocument();
    expect(container.querySelector("[data-upload-picture-thumbnail]")).toHaveAttribute(
      "src",
      "blob:quick-picture",
    );
  });

  it("does not add files when beforeUpload returns false", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Upload beforeUpload={() => false} onChange={onChange}>
        <button>파일 선택</button>
      </Upload>,
    );
    await userEvent.upload(container.querySelector("input")!, new File(["x"], "ignored.txt"));
    await waitFor(() => expect(screen.queryByText("ignored.txt")).not.toBeInTheDocument());
    expect(onChange).not.toHaveBeenCalled();
  });

  it("filters files with accept before adding them", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Upload accept="image/*" onChange={onChange}>
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

    expect(input).toHaveAttribute("accept", "image/*");
    expect(await screen.findByText("photo.png")).toBeInTheDocument();
    expect(screen.queryByText("memo.txt")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("supports asynchronous validation with beforeUpload", async () => {
    const allowedFile = new File(["a"], "allowed.txt");
    const blockedFile = new File(["b"], "blocked.txt");
    const beforeUpload = vi.fn(
      async ({ file }: UploadChangeParam<File>) => file.name === "allowed.txt",
    );
    const { container } = render(
      <Upload multiple beforeUpload={beforeUpload}>
        <button>파일 선택</button>
      </Upload>,
    );

    fireEvent.change(container.querySelector("input")!, {
      target: {
        files: [allowedFile, blockedFile],
      },
    });

    expect(await screen.findByText("allowed.txt")).toBeInTheDocument();
    expect(screen.queryByText("blocked.txt")).not.toBeInTheDocument();
    expect(beforeUpload).toHaveBeenCalledTimes(2);
    expect(beforeUpload).toHaveBeenNthCalledWith(1, {
      file: allowedFile,
      fileList: [allowedFile, blockedFile],
    });
  });

  it("keeps the selected order when beforeUpload resolves out of order", async () => {
    let resolveFirst!: (accepted: boolean) => void;
    const firstValidation = new Promise<boolean>((resolve) => {
      resolveFirst = resolve;
    });
    const beforeUpload = vi.fn(({ file }: UploadChangeParam<File>) =>
      file.name === "first.txt" ? firstValidation : Promise.resolve(true),
    );
    const onChange = vi.fn();
    const { container } = render(
      <Upload multiple beforeUpload={beforeUpload} onChange={onChange}>
        <button>파일 선택</button>
      </Upload>,
    );

    fireEvent.change(container.querySelector("input")!, {
      target: {
        files: [new File(["a"], "first.txt"), new File(["b"], "second.txt")],
      },
    });

    await waitFor(() => expect(beforeUpload).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("second.txt")).not.toBeInTheDocument();

    await act(async () => resolveFirst(true));

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    expect(onChange.mock.calls.map(([info]) => info.file.name)).toEqual([
      "first.txt",
      "second.txt",
    ]);
    expect(
      Array.from(container.querySelectorAll("[data-upload-list-item]")).map(
        (item) => item.textContent,
      ),
    ).toEqual([expect.stringContaining("first.txt"), expect.stringContaining("second.txt")]);
  });

  it("keeps the file when onRemove rejects", async () => {
    const onRemove = vi.fn().mockRejectedValue(new Error("remove failed"));
    const { container } = render(
      <Upload defaultFileList={[{ uid: "1", name: "keep.txt" }]} onRemove={onRemove} />,
    );

    fireEvent.click(container.querySelector("[data-upload-remove-action]")!);

    await waitFor(() => expect(onRemove).toHaveBeenCalledOnce());
    expect(screen.getByText("keep.txt")).toBeInTheDocument();
  });

  it("revokes a controlled preview only after the parent removes the file", async () => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:controlled-preview");
    const revokeObjectUrlMock = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    function ControlledPreview() {
      const [files, setFiles] = useState<UploadFile[]>([]);
      const [allowRemoval, setAllowRemoval] = useState(false);

      return (
        <>
          <button onClick={() => setAllowRemoval(true)}>삭제 반영</button>
          <Upload
            fileList={files}
            listType="picture"
            onChange={({ fileList }) => {
              if (fileList.length >= files.length || allowRemoval) setFiles(fileList);
            }}
          >
            <button>파일 선택</button>
          </Upload>
        </>
      );
    }

    const { container } = render(<ControlledPreview />);
    await userEvent.upload(
      container.querySelector("input[type=file]")!,
      new File(["image"], "preview.png", { type: "image/png" }),
    );
    expect(await screen.findByText("preview.png")).toBeInTheDocument();

    fireEvent.click(container.querySelector("[data-upload-remove-action]")!);
    expect(screen.getByText("preview.png")).toBeInTheDocument();
    expect(revokeObjectUrlMock).not.toHaveBeenCalledWith("blob:controlled-preview");

    await userEvent.click(screen.getByRole("button", { name: "삭제 반영" }));
    fireEvent.click(container.querySelector("[data-upload-remove-action]")!);

    await waitFor(() => expect(screen.queryByText("preview.png")).not.toBeInTheDocument());
    expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:controlled-preview");
  });

  it("keeps only the last selected file when maxCount is one", async () => {
    const { container } = render(
      <Upload multiple maxCount={1}>
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

  it("downloads a remote file through a Blob URL instead of opening its URL", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("report", { status: 200 }));
    const createObjectUrlMock = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:download");
    const revokeObjectUrlMock = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const anchorClickMock = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const { container } = render(
      <Upload
        defaultFileList={[
          {
            uid: "1",
            name: "report.pdf",
            url: "https://example.com/report.pdf",
          },
        ]}
      />,
    );

    fireEvent.click(container.querySelector("[data-upload-download-action]")!);

    await waitFor(() => expect(anchorClickMock).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/report.pdf");
    expect(createObjectUrlMock).toHaveBeenCalledWith(expect.any(Blob));
    expect(document.querySelector('a[download="report.pdf"]')).not.toBeInTheDocument();

    await waitFor(() => expect(revokeObjectUrlMock).toHaveBeenCalledWith("blob:download"));
  });

  it("shows independent loading icons and blocks duplicate download clicks", async () => {
    vi.useFakeTimers();
    try {
      let resolveFirst!: () => void;
      let resolveSecond!: () => void;
      const firstDownload = new Promise<void>((resolve) => {
        resolveFirst = resolve;
      });
      const secondDownload = new Promise<void>((resolve) => {
        resolveSecond = resolve;
      });
      const onDownload = vi.fn((file: UploadFile) =>
        file.uid === "first" ? firstDownload : secondDownload,
      );
      render(
        <Upload
          defaultFileList={[
            { uid: "first", name: "first.pdf" },
            { uid: "second", name: "second.pdf" },
          ]}
          onDownload={onDownload}
        />,
      );
      const firstButton = screen
        .getByText("first.pdf")
        .closest("[data-upload-list-item]")!
        .querySelector<HTMLButtonElement>("[data-upload-download-action]")!;
      const secondButton = screen
        .getByText("second.pdf")
        .closest("[data-upload-list-item]")!
        .querySelector<HTMLButtonElement>("[data-upload-download-action]")!;

      fireEvent.click(firstButton);
      expect(firstButton).toBeDisabled();
      expect(firstButton.querySelector("svg.animate-spin")).not.toBeInTheDocument();
      expect(secondButton).not.toBeDisabled();

      act(() => vi.advanceTimersByTime(DOWNLOAD_LOADING_DELAY - 1));
      expect(firstButton.querySelector("svg.animate-spin")).not.toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1));
      expect(firstButton.querySelector("svg.animate-spin")).toBeInTheDocument();

      fireEvent.click(firstButton);
      expect(onDownload).toHaveBeenCalledTimes(1);

      fireEvent.click(secondButton);
      expect(secondButton).toBeDisabled();
      expect(secondButton.querySelector("svg.animate-spin")).not.toBeInTheDocument();
      expect(onDownload).toHaveBeenCalledTimes(2);
      act(() => vi.advanceTimersByTime(DOWNLOAD_LOADING_DELAY));
      expect(secondButton.querySelector("svg.animate-spin")).toBeInTheDocument();

      await act(async () => resolveFirst());
      expect(firstButton).not.toBeDisabled();
      expect(firstButton.querySelector("svg.animate-spin")).not.toBeInTheDocument();
      expect(secondButton).toBeDisabled();

      await act(async () => resolveSecond());
      expect(secondButton).not.toBeDisabled();
      expect(secondButton.querySelector("svg.animate-spin")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows an error message when the download URL responds with an error", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 404 }));
    const { container } = render(
      <Upload defaultFileList={[{ uid: "missing", name: "missing.pdf", url: "/missing.pdf" }]} />,
    );

    fireEvent.click(container.querySelector("[data-upload-download-action]")!);

    expect(
      await screen.findByText("파일을 다운로드할 수 없어요. 파일 URL을 확인해주세요."),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/missing.pdf");
    message.destroy();
  });

  it("shows an error message when the download request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    const { container } = render(
      <Upload
        defaultFileList={[
          { uid: "network-error", name: "network-error.pdf", url: "/network-error.pdf" },
        ]}
      />,
    );
    const downloadButton = container.querySelector<HTMLButtonElement>(
      "[data-upload-download-action]",
    )!;

    fireEvent.click(downloadButton);

    expect(
      await screen.findByText("파일을 다운로드할 수 없어요. 파일 URL을 확인해주세요."),
    ).toBeInTheDocument();
    await waitFor(() => expect(downloadButton).not.toBeDisabled());
    expect(downloadButton.querySelector("svg.animate-spin")).not.toBeInTheDocument();
    message.destroy();
  });

  it("passes capture to the native file input", () => {
    const { container, rerender } = render(
      <Upload capture>
        <button>카메라 열기</button>
      </Upload>,
    );

    expect(container.querySelector("input[type=file]")).toHaveAttribute("capture");

    rerender(
      <Upload capture={false}>
        <button>파일 선택</button>
      </Upload>,
    );
    expect(container.querySelector("input[type=file]")).not.toHaveAttribute("capture");
  });

  it("hides the file list when showUploadList is false", () => {
    render(
      <Upload defaultFileList={[{ uid: "1", name: "hidden.txt" }]} showUploadList={false}>
        <button>파일 선택</button>
      </Upload>,
    );

    expect(screen.queryByText("hidden.txt")).not.toBeInTheDocument();
  });
});
