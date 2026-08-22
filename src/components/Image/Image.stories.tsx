import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Image } from "./Image";

const picture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop stop-color='%230062df'/%3E%3Cstop offset='1' stop-color='%23722ed1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ccircle cx='320' cy='90' r='45' fill='%23fff' fill-opacity='.8'/%3E%3Cpath d='M0 270 150 120l100 100 80-70 150 120' fill='%23fff' fill-opacity='.55'/%3E%3C/svg%3E";
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Image",
  component: Image,
  tags: ["autodocs"],
  args: { src: picture, alt: "예시 풍경", width: 320, height: 200 },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "이미지를 안정적으로 표시하고 전체 화면 미리보기에서 자세히 살펴봐요.  \n로드 실패 대체 이미지, 자리 표시자, 확대·회전·반전·이동과 그룹 탐색을 지원해요.",
      },
      page: () => (
        <div className="image-docs component-docs">
          <Title />
          <Description />
          <Stories />
          <h2>API</h2>
          <Markdown>{`
### Image

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`src\` | 표시할 이미지 주소예요. | \`string\` | - |
| \`fallback\` | 원본 로드에 실패했을 때 표시할 이미지 주소예요. | \`string\` | - |
| \`width\` | 이미지의 가로 길이를 정해요. | \`string \\| number\` | 원본 너비 |
| \`height\` | 이미지의 세로 길이를 정해요. | \`string \\| number\` | 원본 높이 |
| \`placeholder\` | 이미지를 불러오는 동안 표시할 내용이에요. | \`ReactNode \\| { progress?: boolean \\| object }\` | - |
| \`preview\` | 미리보기를 사용하거나 상세 동작을 설정해요. | \`boolean \\| ImagePreviewConfig\` | \`true\` |
| \`rootClassName\` | 이미지 래퍼에 클래스를 추가해요. | \`string\` | - |
| \`rootStyle\` | 이미지 래퍼에 인라인 스타일을 적용해요. | \`CSSProperties\` | - |

### ImagePreviewConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`open\` | 미리보기 표시 상태를 제어해요. | \`boolean\` | - |
| \`mask\` | 이미지 위 미리보기 마스크와 닫기 동작을 설정해요. | \`boolean \\| object\` | \`true\` |
| \`minScale\` / \`maxScale\` | 확대·축소 가능한 범위를 정해요. | \`number\` | \`1 / 8\` |
| \`scaleStep\` | 한 번에 확대·축소할 비율을 정해요. | \`number\` | \`0.5\` |
| \`movable\` | 확대 이미지를 드래그해 이동할 수 있게 해요. | \`boolean\` | \`true\` |
| \`toolbarRender\` | 미리보기 도구 모음을 사용자 정의해요. | \`(node, info) => ReactNode\` | - |
| \`onOpenChange\` | 미리보기 표시 상태가 바뀔 때 실행해요. | \`(open, previousOpen) => void\` | - |

### Image.PreviewGroup

여러 \`Image\`를 묶어 미리보기에서 앞뒤 이미지로 이동할 수 있어요. \`preview\`에는 같은 미리보기 설정을 전달해요.
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Image>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  parameters: {
    ...storyDescription("components-image--preview"),
    docs: {
      ...storyDescription("components-image--preview").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Image src="/images/landscape.jpg" alt="예시 풍경" width={320} height={200} />`,
        ),
      },
    },
  },
};
export const Fallback: Story = {
  args: { src: "invalid.png", fallback: picture },
  parameters: {
    ...storyDescription("components-image--fallback"),
    docs: {
      ...storyDescription("components-image--fallback").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Image src="/invalid.png" fallback="/images/fallback.jpg" alt="대체 이미지" />`,
        ),
      },
    },
  },
};
export const Group: Story = {
  parameters: {
    ...storyDescription("components-image--group"),
    docs: {
      ...storyDescription("components-image--group").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `<Image.PreviewGroup>\n  <div className="flex gap-3">\n    <Image src="/images/one.jpg" width={180} height={120} alt="첫 이미지" />\n    <Image src="/images/two.jpg" width={180} height={120} alt="둘째 이미지" />\n  </div>\n</Image.PreviewGroup>`,
        ),
      },
    },
  },
  render: () => (
    <Image.PreviewGroup>
      <div className="flex gap-3">
        <Image src={picture} width={180} height={120} alt="첫 이미지" />
        <Image
          src={picture}
          width={180}
          height={120}
          alt="둘째 이미지"
          style={{ filter: "hue-rotate(90deg)" }}
        />
      </div>
    </Image.PreviewGroup>
  ),
};
