import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Calendar } from "./Calendar";
import { Collapse } from "./Collapse";
import { ColorPicker } from "./ColorPicker";
import { DatePicker } from "./DatePicker";
import { Description } from "./Description";
import { Drawer } from "./Drawer";
import { Image } from "./Image";
import { Menu } from "./Menu";
import { Modal } from "./Modal";
import { Skeleton } from "./Skeleton";
import { Tabs } from "./Tabs";
import { TimePicker } from "./TimePicker";
import { Tree } from "./Tree";
import { Upload } from "./Upload";

describe("remaining component className convention", () => {
  it("applies className to each rendered component root", () => {
    const { container } = render(
      <div>
        <Avatar className="avatar-root">A</Avatar>
        <Badge className="badge-root" status="success" />
        <Calendar className="calendar-root" fullscreen={false} />
        <Collapse className="collapse-root" />
        <ColorPicker className="color-picker-root" />
        <DatePicker className="date-picker-root" />
        <Description className="description-root" />
        <Image className="image-root" preview={false} />
        <Menu className="menu-root" />
        <Skeleton className="skeleton-root" />
        <Tabs className="tabs-root" />
        <TimePicker className="time-picker-root" />
        <Tree className="tree-root" />
        <Upload className="upload-root" />
      </div>,
    );

    for (const className of [
      "avatar-root",
      "badge-root",
      "calendar-root",
      "collapse-root",
      "color-picker-root",
      "date-picker-root",
      "description-root",
      "image-root",
      "menu-root",
      "skeleton-root",
      "tabs-root",
      "time-picker-root",
      "tree-root",
      "upload-root",
    ]) {
      expect(container.querySelector(`.${className}`)).toBeInTheDocument();
    }
  });

  it("applies className to portal roots", () => {
    const { rerender } = render(
      <>
        <Modal open className="modal-root" />
        <Drawer open className="drawer-root" />
      </>,
    );

    expect(document.querySelector("[data-modal-root]")).toHaveClass("modal-root");
    expect(document.querySelector("[data-drawer-root]")).toHaveClass("drawer-root");

    rerender(
      <>
        <Modal className="modal-root" />
        <Drawer className="drawer-root" />
      </>,
    );
  });
});
