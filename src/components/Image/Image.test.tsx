import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Image } from "./Image";

describe("Image", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("applies className to the outer image wrapper without adding ARIA attributes", () => {
    const { container } = render(
      <Image className="w-48 rounded-xl" src="photo.png" alt="사진" preview={false} />,
    );

    expect(container.firstChild).toHaveClass("w-48", "rounded-xl");
    expect(container.innerHTML).not.toMatch(/\saria-[\w-]+=/);
  });

  it("shows an image that completed loading before the load handler was attached", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(480);

    render(<Image src="cached.png" alt="캐시 이미지" preview={false} />);

    expect(screen.getByRole("img", { name: "캐시 이미지" })).not.toHaveClass("invisible");
  });

  it("shows an image skeleton while an image is loading", () => {
    const { container } = render(
      <Image src="loading.png" alt="로딩 이미지" width={240} height={150} placeholder />,
    );

    expect(container.querySelector(".wizard-skeleton-active")).toBeInTheDocument();
    fireEvent.load(screen.getByRole("img", { name: "로딩 이미지" }));
    expect(container.querySelector(".wizard-skeleton-active")).not.toBeInTheDocument();
  });

  it("uses the fallback URL after an error", () => {
    render(<Image src="broken.png" fallback="fallback.png" alt="사진" preview={false} />);
    fireEvent.error(screen.getByRole("img", { name: "사진" }));
    expect(screen.getByRole("img", { name: "사진" })).toHaveAttribute("src", "fallback.png");
  });

  it("shows, hides, or customizes the preview cover", () => {
    render(
      <>
        <Image src="default.png" alt="기본 Cover" preview={{ cover: true }} />
        <Image src="hidden.png" alt="Cover 없음" preview={{ cover: false }} />
        <Image
          src="custom.png"
          alt="사용자 정의 Cover"
          preview={{ cover: <span>원본 보기</span> }}
        />
      </>,
    );
    const defaultImage = screen.getByRole("img", { name: "기본 Cover" });
    const hiddenImage = screen.getByRole("img", { name: "Cover 없음" });
    const customImage = screen.getByRole("img", { name: "사용자 정의 Cover" });
    fireEvent.load(defaultImage);
    fireEvent.load(hiddenImage);
    fireEvent.load(customImage);

    expect(
      defaultImage.parentElement?.querySelector("[data-image-preview-cover]"),
    ).toHaveTextContent("미리보기");
    expect(
      hiddenImage.parentElement?.querySelector("[data-image-preview-cover]"),
    ).not.toBeInTheDocument();
    expect(
      customImage.parentElement?.querySelector("[data-image-preview-cover]"),
    ).toHaveTextContent("원본 보기");
  });

  it("opens and closes the preview", async () => {
    render(<Image src="photo.png" alt="사진" />);
    const image = screen.getByRole("img", { name: "사진" });
    vi.spyOn(image, "getBoundingClientRect").mockReturnValue({
      left: 20,
      top: 30,
      width: 100,
      height: 60,
    } as DOMRect);
    fireEvent.load(image);
    await userEvent.click(image);
    expect(document.querySelector("[data-image-preview-root]")).toBeInTheDocument();
    expect(document.querySelector("[data-image-preview-body]")).toHaveStyle({
      transformOrigin: "70px 60px",
    });
    await userEvent.click(document.querySelector("[data-image-preview-close]")!);
    await waitFor(() =>
      expect(document.querySelector("[data-image-preview-root]")).not.toBeInTheDocument(),
    );
  });

  it("shows the default preview mask", async () => {
    render(<Image src="photo.png" alt="마스크가 있는 사진" />);
    const image = screen.getByRole("img", { name: "마스크가 있는 사진" });
    fireEvent.load(image);
    await userEvent.click(image);

    expect(document.querySelector(".wizard-image-preview-mask")).toBeInTheDocument();
    expect(document.querySelector("[data-image-preview-root]")).toBeInTheDocument();
  });

  it("reports preview open state changes", async () => {
    const onOpenChange = vi.fn();
    render(<Image src="photo.png" alt="상태 변경 사진" preview={{ onOpenChange }} />);
    const image = screen.getByRole("img", { name: "상태 변경 사진" });
    fireEvent.load(image);

    await userEvent.click(image);
    expect(onOpenChange).toHaveBeenLastCalledWith(true, false);

    await userEvent.click(document.querySelector("[data-image-preview-close]")!);
    expect(onOpenChange).toHaveBeenLastCalledWith(false, true);
  });

  it("uses preview source and zIndex configuration", async () => {
    render(
      <Image src="thumbnail.png" alt="썸네일" preview={{ src: "detail.png", zIndex: 2200 }} />,
    );
    const image = screen.getByRole("img", { name: "썸네일" });
    fireEvent.load(image);
    await userEvent.click(image);

    expect(document.querySelector("[data-image-preview-root]")).toHaveStyle({ zIndex: "2200" });
    expect(document.querySelector(".wizard-image-preview-image")).toHaveAttribute(
      "src",
      "detail.png",
    );
  });

  it("uses the six image actions and zooms between 25%, 50%, 75%, 100%, and 150%", async () => {
    render(<Image src="photo.png" alt="사진" />);
    fireEvent.load(screen.getByRole("img", { name: "사진" }));
    await userEvent.click(screen.getByRole("img", { name: "사진" }));

    expect(
      Array.from(document.querySelectorAll("[data-image-preview-action]"), (action) =>
        action.getAttribute("data-image-preview-action"),
      ),
    ).toEqual([
      "flip-vertical",
      "flip-horizontal",
      "rotate-left",
      "rotate-right",
      "zoom-out",
      "zoom-in",
    ]);

    const previewImage = document.querySelector<HTMLElement>(".wizard-image-preview-image")!;
    const zoomOut = document.querySelector<HTMLButtonElement>(
      '[data-image-preview-action="zoom-out"]',
    )!;
    const zoomIn = document.querySelector<HTMLButtonElement>(
      '[data-image-preview-action="zoom-in"]',
    )!;

    expect(previewImage).toHaveClass(
      "transition-transform",
      "duration-300",
      "ease-[cubic-bezier(0,0,0.25,1)]",
    );
    expect(zoomOut).toBeEnabled();
    await userEvent.click(zoomOut);
    await waitFor(() => expect(previewImage.style.transform).toContain("scale(0.75, 0.75)"));

    await userEvent.click(zoomOut);
    await waitFor(() => expect(previewImage.style.transform).toContain("scale(0.5, 0.5)"));
    expect(zoomOut).toBeEnabled();

    await userEvent.click(zoomOut);
    await waitFor(() => expect(previewImage.style.transform).toContain("scale(0.25, 0.25)"));
    expect(zoomOut).toBeDisabled();

    await userEvent.click(zoomIn);
    await waitFor(() => expect(previewImage.style.transform).toContain("scale(0.5, 0.5)"));
    expect(zoomOut).toBeEnabled();

    await userEvent.click(zoomIn);
    await waitFor(() => expect(previewImage.style.transform).toContain("scale(0.75, 0.75)"));

    await userEvent.click(zoomIn);
    await waitFor(() => expect(previewImage.style.transform).toContain("scale(1, 1)"));

    await userEvent.click(zoomIn);
    await waitFor(() => expect(previewImage.style.transform).toContain("scale(1.5, 1.5)"));
  });

  it("moves without a transform transition while dragging", async () => {
    render(<Image src="photo.png" alt="사진" />);
    fireEvent.load(screen.getByRole("img", { name: "사진" }));
    await userEvent.click(screen.getByRole("img", { name: "사진" }));

    const previewImage = document.querySelector<HTMLElement>(".wizard-image-preview-image")!;

    fireEvent.pointerDown(previewImage, {
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });
    expect(previewImage).toHaveClass("cursor-grabbing");
    expect(previewImage).not.toHaveClass("transition-transform");

    fireEvent.pointerMove(previewImage, {
      pointerId: 1,
      clientX: 150,
      clientY: 130,
    });
    await waitFor(() => expect(previewImage.style.transform).toContain("translate3d(50px,30px,0)"));

    fireEvent.pointerUp(previewImage, { pointerId: 1 });
    expect(previewImage).toHaveClass("cursor-grab", "transition-transform");
  });

  it("accumulates rapid zoom clicks without dropping an intermediate scale", async () => {
    render(<Image src="photo.png" alt="사진" />);
    fireEvent.load(screen.getByRole("img", { name: "사진" }));
    await userEvent.click(screen.getByRole("img", { name: "사진" }));

    const previewImage = document.querySelector<HTMLElement>(".wizard-image-preview-image")!;
    const zoomOut = document.querySelector<HTMLButtonElement>(
      '[data-image-preview-action="zoom-out"]',
    )!;
    const zoomIn = document.querySelector<HTMLButtonElement>(
      '[data-image-preview-action="zoom-in"]',
    )!;

    fireEvent.click(zoomOut);
    fireEvent.click(zoomOut);
    fireEvent.click(zoomOut);
    await waitFor(() => expect(previewImage.style.transform).toContain("scale(0.25, 0.25)"));

    fireEvent.click(zoomIn);
    fireEvent.click(zoomIn);
    fireEvent.click(zoomIn);
    await waitFor(() => expect(previewImage.style.transform).toContain("scale(1, 1)"));
  });

  it("registers group images once and opens group preview", async () => {
    render(
      <Image.PreviewGroup>
        <Image src="one.png" alt="첫째" />
        <Image src="two.png" alt="둘째" />
      </Image.PreviewGroup>,
    );
    const firstImage = screen.getByRole("img", { name: "첫째" });
    vi.spyOn(firstImage, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 200,
      width: 80,
      height: 40,
    } as DOMRect);
    fireEvent.load(firstImage);
    await userEvent.click(firstImage);
    expect(document.querySelector("[data-image-preview-root]")).toBeInTheDocument();
    expect(document.querySelector("[data-image-preview-body]")).toHaveStyle({
      transformOrigin: "140px 220px",
    });
    expect(document.querySelector("[data-image-preview-next]")).toBeEnabled();
    expect(document.querySelector("[data-image-preview-count]")).toHaveTextContent("1 / 2");
  });
});
