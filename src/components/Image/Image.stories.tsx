import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Image } from "./Image";

const picture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop stop-color='%230062df'/%3E%3Cstop offset='1' stop-color='%23722ed1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ccircle cx='320' cy='90' r='45' fill='%23fff' fill-opacity='.8'/%3E%3Cpath d='M0 270 150 120l100 100 80-70 150 120' fill='%23fff' fill-opacity='.55'/%3E%3C/svg%3E";
const secondPicture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='300'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop stop-color='%231c8616'/%3E%3Cstop offset='1' stop-color='%230062df'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ccircle cx='130' cy='95' r='52' fill='%23fff' fill-opacity='.75'/%3E%3Cpath d='M0 270 120 145l95 80 92-115 173 160' fill='%23fff' fill-opacity='.5'/%3E%3C/svg%3E";
const storyDescription = (id: string) => ({
  docs: { description: { story: storyDescriptions[id] } },
});
const meta = {
  title: "Components/Image",
  component: Image,
  tags: ["autodocs"],
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
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |
| \`style\` | 이미지 요소에 인라인 스타일을 적용해요. | \`CSSProperties\` | - |
| \`rootStyle\` | 이미지 래퍼에 인라인 스타일을 적용해요. | \`CSSProperties\` | - |

### ImagePreviewConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`open\` | 미리보기 표시 상태를 제어해요. | \`boolean\` | - |
| \`src\` | 미리보기에서 사용할 이미지 주소를 변경해요. | \`string\` | Image의 src |
| \`mask\` | 이미지 위 미리보기 마스크와 닫기 동작을 설정해요. | \`boolean \\| object\` | \`true\` |
| \`cover\` | 이미지 hover 영역에 표시할 내용을 설정해요. | \`ReactNode\` | 미리보기 안내 |
| \`closeIcon\` | 미리보기 닫기 아이콘을 변경해요. | \`ReactNode\` | close Icon |
| \`getContainer\` | 미리보기를 렌더링할 컨테이너를 설정해요. | \`HTMLElement \\| () => HTMLElement \\| string \\| false\` | \`document.body\` |
| \`zIndex\` | 미리보기의 겹침 순서를 설정해요. | \`number\` | \`1080\` |
| \`minScale\` / \`maxScale\` | 확대·축소 가능한 범위를 정해요. | \`number\` | \`1 / 50\` |
| \`scaleStep\` | 한 번에 확대·축소할 비율을 정해요. | \`number\` | \`0.5\` |
| \`movable\` | 확대 이미지를 드래그해 이동할 수 있게 해요. | \`boolean\` | \`true\` |
| \`toolbarRender\` | 미리보기 도구 모음을 사용자 정의해요. | \`(node, info) => ReactNode\` | - |
| \`onOpenChange\` | 미리보기 표시 상태가 바뀔 때 실행해요. | \`(open, previousOpen) => void\` | - |
| \`onTransform\` | 확대·회전·이동 상태가 바뀔 때 실행해요. | \`(info) => void\` | - |

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
  args: { src: picture, alt: "예시 풍경", width: 320, height: 200 },
  parameters: {
    ...storyDescription("components-image--preview"),
    docs: {
      ...storyDescription("components-image--preview").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const picture = ${JSON.stringify(picture)};

<Image src={picture} alt="예시 풍경" width={320} height={200} />`,
        ),
      },
    },
  },
};
export const Fallback: Story = {
  args: { src: "invalid.png", fallback: picture, alt: "대체 이미지" },
  parameters: {
    ...storyDescription("components-image--fallback"),
    docs: {
      ...storyDescription("components-image--fallback").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const picture = ${JSON.stringify(picture)};

<Image src="invalid.png" fallback={picture} alt="대체 이미지" />`,
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
          `const picture = ${JSON.stringify(picture)};
const secondPicture = ${JSON.stringify(secondPicture)};

<Image.PreviewGroup>
  <div className="flex gap-3">
    <Image src={picture} width={180} height={120} alt="첫 이미지" />
    <Image src={secondPicture} width={180} height={120} alt="둘째 이미지" />
  </div>
</Image.PreviewGroup>`,
        ),
      },
    },
  },
  render: () => (
    <Image.PreviewGroup>
      <div className="flex gap-3">
        <Image src={picture} width={180} height={120} alt="첫 이미지" />
        <Image src={secondPicture} width={180} height={120} alt="둘째 이미지" />
      </div>
    </Image.PreviewGroup>
  ),
};
