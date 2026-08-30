import { createElement } from "react";
import type { Preview } from "@storybook/react";
import "./preview.css";
import { storyDescriptions } from "../src/storybook/story-descriptions";
import { withStoryImports } from "../src/storybook/story-source";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      if (context.viewMode === "docs") {
        return createElement(Story);
      }

      const description =
        context.parameters.docs?.description?.story ??
        storyDescriptions[context.id] ??
        `${context.name} 기능의 기본 사용법과 상호작용, 관련 속성을 확인해요.`;
      const descriptionLines = String(description).split("\n");
      return createElement(
        "div",
        { className: "story-documented-frame" },
        createElement(
          "aside",
          { className: "story-description" },
          createElement("span", null, context.title.replace("Components/", "").replace("/", " / ")),
          createElement(
            "p",
            null,
            descriptionLines.map((line, index) =>
              createElement(
                "span",
                {
                  className:
                    index > 0
                      ? `story-description-detail${line.startsWith("xs 0px") ? " story-description-detail-same-color" : ""}`
                      : undefined,
                  key: `${index}-${line}`,
                },
                line,
              ),
            ),
          ),
        ),
        createElement("div", { className: "story-render" }, createElement(Story)),
      );
    },
  ],
  parameters: {
    layout: "padded",
    options: {
      storySort: (a, b) => {
        const componentRank = (title) => {
          if (title === "Components/Icon") return 0;
          if (title === "Components/Button") return 1;
          if (title === "Components/Tag") return 2;
          if (title === "Components/Checkbox") return 3;
          if (title === "Components/Radio") return 4;
          if (title === "Components/Toggle") return 5;
          if (title === "Components/Label") return 6;
          if (title === "Components/ErrorMessage") return 7;
          if (title === "Components/Breadcrumb") return 8;
          if (title === "Components/Input") return 9;
          if (title === "Components/TextArea") return 10;
          if (title === "Components/Tooltip") return 11;
          if (title === "Components/Popover") return 12;
          if (title === "Components/Dropdown") return 13;
          if (title === "Components/Segmented") return 14;
          if (title === "Components/Illustrations") return 15;
          if (title === "Components/Flex") return 16;
          if (title === "Components/Select") return 17;
          if (title === "Components/Table") return 18;
          if (title === "Components/Badge") return 19;
          if (title === "Components/ColorPicker") return 20;
          if (title === "Components/Avatar") return 21;
          if (title === "Components/Image") return 22;
          if (title === "Components/Collapse") return 23;
          if (title === "Components/Message") return 24;
          if (title === "Components/Notification") return 25;
          if (title === "Components/Modal") return 26;
          if (title === "Components/Drawer") return 27;
          if (title === "Components/DatePicker") return 28;
          if (title === "Components/TimePicker") return 29;
          return 30;
        };
        const rankDifference = componentRank(a.title) - componentRank(b.title);

        if (rankDifference !== 0) return rankDifference;

        if (a.title === "Components/Table" && b.title === "Components/Table") {
          const groupRank = (id) => {
            if (id === "components-table--documentation") return 0;
            if (id.startsWith("components-table--")) return 1;
            if (id === "components-table-api-compatibility--fixed-table-height") return 2.4;
            if (id === "components-table-api-compatibility--sticky-header") return 2.5;
            if (id === "components-table-api-compatibility--fixed-columns") return 2.6;
            if (id === "components-table-layout--virtual-thousand-rows") return 2.7;
            if (id === "components-table-api-compatibility--imperative-scroll-to") return 2.7;
            if (id.startsWith("components-table-api-compatibility--")) return 2;
            if (id.startsWith("components-table-expandable--")) return 3;
            if (id.startsWith("components-table-layout--")) return 4;
            if (id.startsWith("components-table-pagination--")) return 5;
            if (id.startsWith("components-table-selection--")) return 6;
            if (id.startsWith("components-table-sorting-filtering--")) return 7;
            return 9;
          };

          return groupRank(a.id) - groupRank(b.id);
        }

        if (a.title === "Components/DatePicker" && b.title === "Components/DatePicker") {
          const storyOrder = [
            "components-datepicker--documentation",
            "components-datepicker--basic",
            "components-datepicker--sizes",
            "components-datepicker--widths",
            "components-datepicker--variants",
            "components-datepicker--states",
            "components-datepicker--label-and-error",
            "components-datepicker--picker-types",
            "components-datepicker--multiple",
            "components-datepicker--range",
            "components-datepicker--presets",
            "components-datepicker--range-presets",
            "components-datepicker--show-time-and-confirm",
            "components-datepicker--date-limits",
            "components-datepicker--format",
            "components-datepicker--custom-cell",
            "components-datepicker--controlled-panel",
            "components-datepicker--placements",
          ];
          const storyRank = (id) => {
            const index = storyOrder.indexOf(id);
            return index === -1 ? storyOrder.length : index;
          };

          return storyRank(a.id) - storyRank(b.id);
        }

        if (a.title !== b.title) return 0;

        return Number(b.name === "Documentation") - Number(a.name === "Documentation");
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
      },
    },
    docs: {
      source: { transform: withStoryImports },
    },
  },
};

export default preview;
