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
        createElement(Story),
      );
    },
  ],
  parameters: {
    layout: "padded",
    a11y: { test: "todo" },
    options: {
      storySort: (a, b) => {
        if (a.title === "Components/Table" && b.title === "Components/Table") {
          const groupRank = (id) => {
            if (id === "components-table--documentation") return 0;
            if (id.startsWith("components-table--")) return 1;
            if (id === "components-table-layout--virtual-thousand-rows") return 2.5;
            if (id === "components-table-api-compatibility--imperative-scroll-to") return 2.6;
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

        if (a.title !== b.title) return 0;

        return Number(b.name === "Documentation") - Number(a.name === "Documentation");
      },
    },
    controls: {
      exclude: /^aria-/,
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
