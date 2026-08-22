import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Image } from "./Image";

describe("Image", () => {
  it("uses the fallback URL after an error", () => {
    render(<Image src="broken.png" fallback="fallback.png" alt="사진" preview={false} />);
    fireEvent.error(screen.getByRole("img", { name: "사진" }));
    expect(screen.getByRole("img", { name: "사진" })).toHaveAttribute("src", "fallback.png");
  });

  it("opens and closes the preview", async () => {
    render(<Image src="photo.png" alt="사진" />);
    fireEvent.load(screen.getByRole("img", { name: "사진" }));
    await userEvent.click(screen.getByRole("img", { name: "사진" }));
    expect(screen.getByRole("dialog", { name: "이미지 미리보기" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "미리보기 닫기" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("registers group images once and opens group preview", async () => {
    render(
      <Image.PreviewGroup>
        <Image src="one.png" alt="첫째" />
        <Image src="two.png" alt="둘째" />
      </Image.PreviewGroup>,
    );
    fireEvent.load(screen.getByRole("img", { name: "첫째" }));
    await userEvent.click(screen.getByRole("img", { name: "첫째" }));
    expect(screen.getByRole("dialog", { name: "이미지 미리보기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 이미지" })).toBeEnabled();
  });
});
