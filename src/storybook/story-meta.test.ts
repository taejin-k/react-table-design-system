import { describe, expect, it } from "vitest";
import breadcrumbMeta from "../components/Breadcrumb/Breadcrumb.stories";
import buttonMeta from "../components/Button/Button.stories";
import checkboxMeta from "../components/Checkbox/Checkbox.stories";
import dropdownMeta from "../components/Dropdown/Dropdown.stories";
import errorMessageMeta from "../components/ErrorMessage/ErrorMessage.stories";
import flexMeta from "../components/Flex/Flex.stories";
import iconMeta from "../components/Icon/Icon.stories";
import illustrationsMeta from "../components/Illustrations/Illustrations.stories";
import inputMeta from "../components/Input/Input.stories";
import labelMeta from "../components/Label/Label.stories";
import popoverMeta from "../components/Popover/Popover.stories";
import radioMeta from "../components/Radio/Radio.stories";
import segmentedMeta from "../components/Segmented/Segmented.stories";
import selectMeta from "../components/Select/Select.stories";
import tagMeta from "../components/Tag/Tag.stories";
import textAreaMeta from "../components/TextArea/TextArea.stories";
import toggleMeta from "../components/Toggle/Toggle.stories";
import tooltipMeta from "../components/Tooltip/Tooltip.stories";

describe("component story metadata", () => {
  it.each([
    ["Icon", iconMeta],
    ["Button", buttonMeta],
    ["Tag", tagMeta],
    ["Checkbox", checkboxMeta],
    ["Radio", radioMeta],
    ["Toggle", toggleMeta],
    ["Label", labelMeta],
    ["ErrorMessage", errorMessageMeta],
    ["Breadcrumb", breadcrumbMeta],
    ["Input", inputMeta],
    ["TextArea", textAreaMeta],
    ["Tooltip", tooltipMeta],
    ["Popover", popoverMeta],
    ["Dropdown", dropdownMeta],
    ["Segmented", segmentedMeta],
    ["Illustrations", illustrationsMeta],
    ["Flex", flexMeta],
    ["Select", selectMeta],
  ])("does not give %s stories shared args", (_name, meta) => {
    expect(meta).not.toHaveProperty("args");
  });
});
