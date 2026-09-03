import { Description, Markdown, Stories, Title } from "@storybook/addon-docs/blocks";
import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ComponentProps } from "react";
import { storyDescriptions } from "../../storybook/story-descriptions";
import { withStoryImports } from "../../storybook/story-source";
import { Button } from "../Button";
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
  argTypes: {
    width: { name: "가로 길이", control: { type: "number", min: 0, step: 1 } },
    height: { name: "세로 길이", control: { type: "number", min: 0, step: 1 } },
    alt: { name: "대체 텍스트", control: "text" },
    placeholder: { name: "로딩 Skeleton", control: "boolean" },
    preview: { name: "미리보기", control: "boolean" },
    src: { control: false, table: { disable: true } },
    fallback: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  parameters: {
    controls: { disable: false },
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
| \`placeholder\` | 로딩 중 Image Skeleton을 표시해요. | \`boolean\` | \`false\` |
| \`preview\` | 미리보기를 사용하거나 상세 동작을 설정해요. | \`boolean\` \\| [\`ImagePreviewConfig\`](#imagepreviewconfig) | \`true\` |
| \`className\` | 최상위 요소에 Tailwind 클래스를 추가해요. | \`string\` | - |

### ImagePreviewConfig

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`open\` | 미리보기 표시 상태를 제어해요. | \`boolean\` | - |
| \`src\` | 미리보기에서 사용할 이미지 주소를 변경해요. | \`string\` | Image의 src |
| \`cover\` | hover 미리보기 안내를 표시해요. | \`boolean\` | \`true\` |
| \`mask\` | 배경 마스크를 표시해요. | \`boolean\` | \`true\` |
| \`zIndex\` | 미리보기의 겹침 순서를 설정해요. | \`number\` | \`1080\` |
| \`onOpenChange\` | 미리보기 표시 상태가 바뀔 때 실행해요. | \`(open, previousOpen) => void\` | - |

### Image.PreviewGroup

| Name | Description | Type | Default |
| --- | --- | --- | --- |
| \`children\` | 함께 탐색할 Image를 전달해요. | \`ReactNode\` | - |
          `}</Markdown>
        </div>
      ),
    },
  },
} satisfies Meta<typeof Image>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    src: picture,
    alt: "예시 풍경",
    width: 320,
    height: 200,
    placeholder: false,
    preview: true,
  },
  parameters: {
    ...storyDescription("components-image--basic"),
    controls: {
      disable: false,
      include: ["가로 길이", "세로 길이", "미리보기"],
    },
    docs: {
      ...storyDescription("components-image--basic").docs,
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

export const Cover: Story = {
  args: { width: 220, height: 140, alt: "Cover 예시", placeholder: false },
  parameters: {
    ...storyDescription("components-image--cover"),
    controls: {
      disable: false,
      include: ["가로 길이", "세로 길이"],
    },
    docs: {
      ...storyDescription("components-image--cover").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const picture = ${JSON.stringify(picture)};

<div className="flex flex-wrap gap-4">
  <div>
    <p className="mb-2 text-sm text-dark-gray">Default</p>
    <Image
      src={picture}
      alt="기본 Cover"
      width={220}
      height={140}
      preview={{ cover: true }}
    />
  </div>
  <div>
    <p className="mb-2 text-sm text-dark-gray">Hidden</p>
    <Image
      src={picture}
      alt="Cover 없음"
      width={220}
      height={140}
      preview={{ cover: false }}
    />
  </div>
</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <div>
        <p className="mb-2 text-sm text-dark-gray">Default</p>
        <Image {...args} src={picture} preview={{ cover: true }} />
      </div>
      <div>
        <p className="mb-2 text-sm text-dark-gray">Hidden</p>
        <Image {...args} src={picture} preview={{ cover: false }} />
      </div>
    </div>
  ),
};

export const Dimensions: Story = {
  args: { alt: "크기 비교 풍경", placeholder: false, preview: true },
  parameters: {
    ...storyDescription("components-image--dimensions"),
    controls: { disable: false, include: ["미리보기"] },
    docs: {
      ...storyDescription("components-image--dimensions").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const picture = ${JSON.stringify(picture)};

<div className="flex flex-wrap items-end gap-4">
  <Image src={picture} alt="작은 풍경" width={160} height={100} />
  <Image src={picture} alt="중간 풍경" width={240} height={150} />
  <Image src={picture} alt="큰 풍경" width={320} height={200} />
</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-end gap-4">
      <Image {...args} src={picture} width={160} height={100} />
      <Image {...args} src={picture} width={240} height={150} />
      <Image {...args} src={picture} width={320} height={200} />
    </div>
  ),
};

function PlaceholderExample(args: ComponentProps<typeof Image>) {
  const [version, setVersion] = useState(0);
  const source = `https://picsum.photos/seed/wizard-image-${version}`;

  return (
    <div className="grid justify-items-start gap-4">
      <Button onClick={() => setVersion((current) => current + 1)}>다시 불러오기</Button>
      <Image key={version} src={`${source}/480/300`} {...args} placeholder />
    </div>
  );
}

export const Placeholder: Story = {
  args: { alt: "자리 표시자 예시", width: 320, height: 200, preview: true },
  parameters: {
    ...storyDescription("components-image--placeholder"),
    controls: {
      disable: false,
      include: ["가로 길이", "세로 길이", "미리보기"],
    },
    docs: {
      ...storyDescription("components-image--placeholder").docs,
      source: {
        type: "code",
        code: withStoryImports(`function Placeholder() {
  const [version, setVersion] = useState(0);
  const source = \`https://picsum.photos/seed/wizard-image-\${version}\`;

  return (
    <div className="grid justify-items-start gap-4">
      <Button onClick={() => setVersion((current) => current + 1)}>
        다시 불러오기
      </Button>
      <Image
        key={version}
        src={\`\${source}/480/300\`}
        alt="자리 표시자 예시"
        width={320}
        height={200}
        placeholder
      />
    </div>
  );
}`),
      },
    },
  },
  render: (args) => <PlaceholderExample {...args} />,
};

export const Group: Story = {
  args: { width: 180, height: 120, placeholder: false },
  parameters: {
    ...storyDescription("components-image--group"),
    controls: { disable: false, include: ["가로 길이", "세로 길이"] },
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
  render: (args) => (
    <Image.PreviewGroup>
      <div className="flex gap-3">
        <Image {...args} src={picture} alt="첫 이미지" />
        <Image {...args} src={secondPicture} alt="둘째 이미지" />
      </div>
    </Image.PreviewGroup>
  ),
};

export const PreviewOptions: Story = {
  args: { width: 240, height: 150, alt: "미리보기 옵션 풍경", placeholder: false },
  parameters: {
    ...storyDescription("components-image--preview-options"),
    controls: {
      disable: false,
      include: ["가로 길이", "세로 길이"],
    },
    docs: {
      ...storyDescription("components-image--preview-options").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const picture = ${JSON.stringify(picture)};
const detailImage = ${JSON.stringify(secondPicture)};

<div className="flex flex-wrap gap-4">
  <Image
    src={picture}
    alt="미리보기를 사용하지 않는 풍경"
    width={240}
    height={150}
    preview={false}
  />
  <Image
    src={picture}
    alt="상세 이미지가 따로 있는 풍경"
    width={240}
    height={150}
    preview={{ src: detailImage }}
  />
</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <Image {...args} src={picture} preview={false} />
      <Image {...args} src={picture} preview={{ src: secondPicture }} />
    </div>
  ),
};

export const PreviewMask: Story = {
  args: { width: 200, height: 125, alt: "마스크 설정 풍경", placeholder: false },
  parameters: {
    ...storyDescription("components-image--preview-mask"),
    controls: {
      disable: false,
      include: ["가로 길이", "세로 길이"],
    },
    docs: {
      ...storyDescription("components-image--preview-mask").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const picture = ${JSON.stringify(picture)};

<div className="flex flex-wrap gap-4">
  <div>
    <p className="mb-2 text-sm text-dark-gray">Default</p>
    <Image src={picture} alt="기본 마스크" width={200} height={125} />
  </div>
  <div>
    <p className="mb-2 text-sm text-dark-gray">Hidden</p>
    <Image
      src={picture}
      alt="마스크 없음"
      width={200}
      height={125}
      preview={{ mask: false }}
    />
  </div>
</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <div>
        <p className="mb-2 text-sm text-dark-gray">Default</p>
        <Image {...args} src={picture} alt="기본 마스크" />
      </div>
      <div>
        <p className="mb-2 text-sm text-dark-gray">Hidden</p>
        <Image {...args} src={picture} alt="마스크 없음" preview={{ mask: false }} />
      </div>
    </div>
  ),
};

function ControlledPreviewExample(args: ComponentProps<typeof Image>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>미리보기 열기</Button>
      <Image
        {...args}
        className="hidden"
        src={picture}
        preview={{
          open,
          onOpenChange: setOpen,
        }}
      />
    </>
  );
}

export const ControlledPreview: Story = {
  args: { alt: "제어형 미리보기" },
  parameters: {
    ...storyDescription("components-image--controlled-preview"),
    controls: { disable: true },
    docs: {
      ...storyDescription("components-image--controlled-preview").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const picture = ${JSON.stringify(picture)};

function ControlledPreview() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>미리보기 열기</Button>
      <Image
        className="hidden"
        src={picture}
        preview={{
          open,
          onOpenChange: setOpen,
        }}
      />
    </>
  );
}`,
        ),
      },
    },
  },
  render: (args) => <ControlledPreviewExample {...args} />,
};

export const Fallback: Story = {
  args: { width: 240, height: 150, placeholder: false, preview: false },
  parameters: {
    ...storyDescription("components-image--fallback"),
    controls: {
      disable: false,
      include: ["가로 길이", "세로 길이"],
    },
    docs: {
      ...storyDescription("components-image--fallback").docs,
      source: {
        type: "code",
        code: withStoryImports(
          `const originalImage = ${JSON.stringify(picture)};
const fallbackImage = ${JSON.stringify(secondPicture)};

<div className="flex flex-wrap gap-4">
  <div>
    <p className="mb-2 text-sm text-dark-gray">정상 원본 이미지</p>
    <Image
      src={originalImage}
      alt="정상 원본 이미지"
      width={240}
      height={150}
      preview={false}
    />
  </div>
  <div>
    <p className="mb-2 text-sm text-dark-gray">원본 로드 실패 → 대체 이미지</p>
    <Image
      src="invalid-image.png"
      fallback={fallbackImage}
      alt="대체 이미지가 적용된 결과"
      width={240}
      height={150}
      preview={false}
    />
  </div>
</div>`,
        ),
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      <div>
        <p className="mb-2 text-sm text-dark-gray">정상 원본 이미지</p>
        <Image {...args} src={picture} alt="정상 원본 이미지" />
      </div>
      <div>
        <p className="mb-2 text-sm text-dark-gray">원본 로드 실패 → 대체 이미지</p>
        <Image
          {...args}
          src="invalid-image.png"
          fallback={secondPicture}
          alt="대체 이미지가 적용된 결과"
        />
      </div>
    </div>
  ),
};
