import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
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
        <Avatar size="small" src="small-broken.png" />
        <Avatar size="medium" src="medium-broken.png" />
        <Avatar size="large" src="large-broken.png" />
      </>,
    );

    container.querySelectorAll("img").forEach((image) => fireEvent.error(image));

    const icons = container.querySelectorAll("svg");
    expect(Array.from(icons, (icon) => icon.getAttribute("width"))).toEqual(["14", "18", "20"]);
  });

  it("shows the full text beside the avatar when type is label", () => {
    render(<Avatar type="label">manhat</Avatar>);
    expect(screen.getByText("m")).toBeInTheDocument();
    expect(screen.getByText("manhat")).toBeInTheDocument();
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
