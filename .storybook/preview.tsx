import { createElement } from "react";
import type { Preview } from "@storybook/react";
import "./preview.css";
import { storyDescriptions } from "../src/storybook/story-descriptions";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      if (
        context.viewMode === "docs" &&
        [
          "Components/Breadcrumb",
          "Components/Button",
          "Components/Checkbox",
          "Components/Chip",
          "Components/ErrorText",
          "Components/Icon",
          "Components/Input",
          "Components/Label",
          "Components/Radio",
          "Components/Toggle",
        ].includes(context.title)
      ) {
        return createElement(Story);
      }

      const description =
        context.parameters.docs?.description?.story ??
        storyDescriptions[context.id] ??
        `${context.name} 기능의 기본 사용법과 상호작용, 관련 속성을 확인합니다.`;
      return createElement(
        "div",
        { className: "story-documented-frame" },
        createElement(
          "aside",
          { className: "story-description", role: "note", "aria-label": "Story 기능 설명" },
          createElement("span", null, context.title.replace("Components/", "").replace("/", " / ")),
          createElement("p", null, String(description)),
        ),
        createElement(Story),
      );
    },
  ],
  parameters: {
    layout: "padded",
    a11y: { test: "todo" },
    controls: {
      exclude: /^aria-/,
      matchers: {
        color: /(background|color)$/i,
      },
    },
  },
};

export default preview;
