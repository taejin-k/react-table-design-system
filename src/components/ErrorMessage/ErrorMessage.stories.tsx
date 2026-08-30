import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { ErrorMessage } from "./ErrorMessage";

const meta = {
  title: "Components/ErrorMessage",
  component: ErrorMessage,
  tags: ["autodocs"],
  argTypes: {
    errorMessage: { name: "오류 문구", control: "text" },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        component:
          "입력값에 문제가 있을 때 오류 내용을 안내해요.  \n표시할 문구를 직접 설정할 수 있어요.",
      },
      page: () => (
        <div className="error-message-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### ErrorMessage

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`errorMessage\` | 표시할 오류 문구를 전달해요. 값이 없으면 영역이 접혀요. | \`ReactNode\` | - |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Message: Story = {
  args: { errorMessage: "입력한 내용을 다시 확인해 주세요." },
  parameters: {
    docs: { description: { story: storyDescriptions["components-errormessage--message"] } },
    controls: { disable: false, include: ["오류 문구"] },
  },
};
