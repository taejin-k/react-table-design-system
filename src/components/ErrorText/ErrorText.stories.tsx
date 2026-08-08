import type { Meta, StoryObj } from "@storybook/react";
import { ErrorText } from "./ErrorText";

const meta: Meta<typeof ErrorText> = {
  title: "Components/ErrorText",
  component: ErrorText,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "폼 오류를 보조기기에 알리고 내용 유무에 따라 부드럽게 열고 닫는 공통 오류 메시지입니다.",
      },
    },
  },
  args: {
    children: "Error message",
  },
};

export default meta;
type Story = StoryObj<typeof ErrorText>;

export const Default: Story = {};

export const Empty: Story = {
  args: { children: undefined },
};
