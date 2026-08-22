import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("uses children as the image fallback", () => {
    const { container } = render(<Avatar src="broken.png">KT</Avatar>);
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByText("KT")).toBeInTheDocument();
  });

  it("collapses overflowing group members", () => {
    render(
      <Avatar.Group max={{ count: 2 }}>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
      </Avatar.Group>,
    );
    expect(screen.getByText("+1")).toBeInTheDocument();
  });
});
