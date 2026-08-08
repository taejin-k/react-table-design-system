import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { ErrorText } from "./ErrorText";

const meta = {
  title: "Components/ErrorText",
  component: ErrorText,
  tags: ["autodocs"],
  args: { children: "입력한 내용을 다시 확인해 주세요." },
  argTypes: {
    children: { name: "오류 문구", control: "text" },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "입력값에 문제가 있을 때 오류 내용을 안내해요.  \n표시할 문구를 직접 설정할 수 있어요.",
      },
      page: () => (
        <div className="error-text-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### ErrorText

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`children\` | 표시할 오류 문구를 전달해요. 값이 없으면 영역이 접혀요. | \`ReactNode\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof ErrorText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Message: Story = {
  parameters: {
    docs: { description: { story: storyDescriptions["components-errortext--message"] } },
    controls: { disable: false },
  },
};
