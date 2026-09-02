import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Calendar } from "./Calendar";
import { Collapse } from "./Collapse";
import { ColorPicker } from "./ColorPicker";
import { DatePicker } from "./DatePicker";
import { Image } from "./Image";
import { Menu } from "./Menu";
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
        <Image className="image-root" preview={false} />
        <Menu className="menu-root" />
        <Skeleton.Node className="skeleton-root" />
        <Tabs className="tabs-root" />
        <TimePicker className="time-picker-root" />
        <Tree className="tree-root" />
        <Upload className="upload-root" />
        <Upload.Dragger className="upload-dragger-root" />
      </div>,
    );

    for (const className of [
      "avatar-root",
      "badge-root",
      "calendar-root",
      "collapse-root",
      "color-picker-root",
      "date-picker-root",
      "image-root",
      "menu-root",
      "skeleton-root",
      "tabs-root",
      "time-picker-root",
      "tree-root",
      "upload-root",
      "upload-dragger-root",
    ]) {
      expect(container.querySelector(`.${className}`)).toBeInTheDocument();
    }
  });

  it("applies DatePicker through Skeleton className to the outermost element", () => {
    const cases: Array<[ReactElement, string]> = [
      [<DatePicker className="date-picker-outer" />, "date-picker-outer"],
      [<DatePicker.RangePicker className="date-range-picker-outer" />, "date-range-picker-outer"],
      [<TimePicker className="time-picker-outer" />, "time-picker-outer"],
      [<Calendar className="calendar-outer" />, "calendar-outer"],
      [<Menu className="menu-outer" />, "menu-outer"],
      [<Skeleton.Avatar className="skeleton-avatar-outer" />, "skeleton-avatar-outer"],
      [<Skeleton.Button className="skeleton-button-outer" />, "skeleton-button-outer"],
      [<Skeleton.Input className="skeleton-input-outer" />, "skeleton-input-outer"],
      [<Skeleton.Image className="skeleton-image-outer" />, "skeleton-image-outer"],
      [<Skeleton.Node className="skeleton-node-outer" />, "skeleton-node-outer"],
    ];

    for (const [element, className] of cases) {
      const { container, unmount } = render(element);
      expect(container.firstElementChild).toHaveClass(className);
      unmount();
    }
  });
});
