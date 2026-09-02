import { render } from "@testing-library/react";
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
        <Skeleton className="skeleton-root" />
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
});
