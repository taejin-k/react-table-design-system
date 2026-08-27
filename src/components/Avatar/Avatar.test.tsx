import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("applies className to each public root without adding ARIA attributes", () => {
    const { container } = render(
      <>
        <Avatar className="ring-1">K</Avatar>
        <Avatar label className="bg-red-50">
          Kim
        </Avatar>
        <Avatar.Group className="gap-1">
          <Avatar>A</Avatar>
        </Avatar.Group>
      </>,
    );

    expect(container.children[0]).toHaveClass("ring-1");
    expect(container.children[1]).toHaveClass("bg-red-50");
    expect(container.children[2]).toHaveClass("gap-1");
    expect(container.innerHTML).not.toMatch(/\saria-[\w-]+=/);
  });

  it("applies color as the avatar background", () => {
    const { container } = render(<Avatar color="#722ed1">KT</Avatar>);
    expect(container.firstChild).toHaveStyle({ backgroundColor: "#722ed1" });
  });

  it("uses children as the image fallback", () => {
    const { container } = render(<Avatar src="broken.png">KT</Avatar>);
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("shows only the first character of text children", () => {
    render(<Avatar>김민준</Avatar>);
    expect(screen.getByText("김")).toBeInTheDocument();
    expect(screen.queryByText("김민준")).not.toBeInTheDocument();
  });

  it("scales the image error icon with the avatar size", () => {
    const { container } = render(
      <>
        <Avatar size="md" src="md-broken.png" />
        <Avatar size="lg" src="lg-broken.png" />
      </>,
    );

    container.querySelectorAll("img").forEach((image) => fireEvent.error(image));

    const icons = container.querySelectorAll("svg");
    expect(Array.from(icons, (icon) => icon.getAttribute("width"))).toEqual(["18", "24"]);
  });

  it("keeps the user fallback visible and hides a broken image", () => {
    const { container } = render(<Avatar src="broken.png" />);
    const image = container.querySelector("img")!;

    expect(image).toHaveClass("opacity-0");
    expect(container.querySelector("svg")).toBeInTheDocument();

    fireEvent.error(image);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("uses 30px for md and 40px for lg", () => {
    const { container } = render(
      <>
        <Avatar size="md">M</Avatar>
        <Avatar size="lg">L</Avatar>
      </>,
    );

    expect(container.children[0]).toHaveStyle({ width: "30px", height: "30px" });
    expect(container.children[1]).toHaveStyle({ width: "40px", height: "40px" });
  });

  it("opens the image preview when preview is enabled", async () => {
    render(<Avatar src="avatar.png" alt="사용자" preview />);

    const image = screen.getByRole("img", { name: "사용자" });
    fireEvent.load(image);
    await userEvent.click(image);

    expect(document.querySelector("[data-image-preview-root]")).toBeInTheDocument();
  });

  it("opens the image preview from a label avatar", async () => {
    render(
      <Avatar label src="avatar.png" alt="사용자" preview>
        manhat
      </Avatar>,
    );

    const image = screen.getByRole("img", { name: "사용자" });
    fireEvent.load(image);
    await userEvent.click(image);

    expect(document.querySelector("[data-image-preview-root]")).toBeInTheDocument();
  });

  it("does not open the image preview by default", async () => {
    render(<Avatar src="avatar.png" alt="사용자" />);

    await userEvent.click(screen.getByRole("img", { name: "사용자" }));

    expect(document.querySelector("[data-image-preview-root]")).not.toBeInTheDocument();
  });

  it("shows the full text beside the avatar when label is true", () => {
    render(<Avatar label>manhat</Avatar>);
    expect(screen.getByText("m")).toBeInTheDocument();
    expect(screen.getByText("manhat")).toBeInTheDocument();
  });

  it("limits label width and truncates overflowing text", () => {
    const { container } = render(
      <Avatar label labelWidth={120}>
        매우 긴 사용자 이름
      </Avatar>,
    );

    expect(container.firstChild).toHaveStyle({ width: "120px" });
    expect(screen.getByText("매우 긴 사용자 이름")).toHaveClass("truncate");
  });

  it("does not enable the label with labelWidth alone", () => {
    const { container } = render(<Avatar labelWidth={120}>김민준</Avatar>);

    expect(container.firstChild).toHaveStyle({ width: "30px" });
    expect(screen.getByText("김")).toBeInTheDocument();
    expect(screen.queryByText("김민준")).not.toBeInTheDocument();
  });

  it("collapses overflowing group members", () => {
    render(
      <Avatar.Group maxCount={2}>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
      </Avatar.Group>,
    );
    expect(screen.getByText("+1")).toBeInTheDocument();
  });
});
