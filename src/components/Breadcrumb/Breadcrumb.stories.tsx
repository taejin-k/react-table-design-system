import { useState, type ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumb } from './Breadcrumb'
import type { BreadcrumbItemType, BreadcrumbProps } from './Breadcrumb.types'

const basicItems: BreadcrumbItemType[] = [
  { title: '홈', href: '#' },
  { title: '컴포넌트', href: '#components' },
  { title: 'Breadcrumb' },
]

function StoryHomeIcon() {
  return <svg className="story-breadcrumb-icon" viewBox="0 0 16 16" aria-hidden><path d="M2.5 7.1 8 2.7l5.5 4.4v6.2h-3.4V9.5H5.9v3.8H2.5Z" /></svg>
}

function StoryComponentsIcon() {
  return <svg className="story-breadcrumb-icon" viewBox="0 0 16 16" aria-hidden><rect x="2.5" y="2.5" width="4.2" height="4.2" rx=".7" /><rect x="9.3" y="2.5" width="4.2" height="4.2" rx=".7" /><rect x="2.5" y="9.3" width="4.2" height="4.2" rx=".7" /><rect x="9.3" y="9.3" width="4.2" height="4.2" rx=".7" /></svg>
}

const componentMenu = {
  items: [
    { key: 'general', label: 'General', path: '/general' },
    { key: 'layout', label: 'Layout', path: '/layout' },
    { key: 'navigation', label: 'Navigation', path: '/navigation' },
    { key: 'divider', type: 'divider' as const },
    { key: 'disabled', label: '준비 중인 컴포넌트', disabled: true },
  ],
}

const meta: Meta<BreadcrumbProps> = {
  title: 'Design System/Breadcrumb',
  component: Breadcrumb as ComponentType<BreadcrumbProps>,
  tags: ['autodocs'],
  args: { items: basicItems },
}

export default meta
type Story = StoryObj<BreadcrumbProps>

export const FeatureGuide: Story = { render: () => <div className="story-feature-guide"><div><h2>경로 모델</h2><p>items, href, 누적 path, params와 itemRender를 Ant Design 방식으로 사용합니다.</p></div><div><h2>표현</h2><p>아이콘, separator, semantic classNames/styles와 긴 경로 줄바꿈을 지원합니다.</p></div><div><h2>Dropdown</h2><p>hover/click, 제어 상태, 배치, 포털, 메뉴 콜백을 지원합니다.</p></div><div><h2>접근성</h2><p>nav/ol 구조, 현재 페이지, 키보드 열기, Escape와 포커스 복귀를 제공합니다.</p></div></div> }

export const Basic: Story = {}

export const CustomSeparator: Story = { args: { separator: '›' } }

export const IconAndRichTitle: Story = { args: { items: [{ title: <span><StoryHomeIcon />홈</span>, href: '#' }, { title: <span><StoryComponentsIcon />디자인 시스템</span>, href: '#design-system' }, { title: <strong>Breadcrumb</strong> }] } }

export const ExplicitSeparatorItem: Story = { args: { separator: '/', items: [{ title: '위치' }, { type: 'separator', separator: ':' }, { title: '서울' }, { type: 'separator', separator: '→' }, { title: '강남구' }] } }

export const PathAndParams: Story = { args: { params: { organizationId: 18, memberId: 1042 }, items: [{ title: '조직', path: 'organizations' }, { title: '조직 :organizationId', path: ':organizationId' }, { title: '구성원 :memberId', path: 'members/:memberId' }] } }

export const CustomItemRender: Story = { args: { items: [{ title: '대시보드', path: 'dashboard' }, { title: '리포트', path: 'reports' }, { title: '2026년 8월', path: '2026-08' }], itemRender: (route, _params, routes, paths) => {
  const last = route === routes[routes.length - 1]
  const title = 'title' in route ? route.title : null
  return last ? <strong>{title}</strong> : <a href={`#/${paths.join('/')}`} onClick={(event) => event.preventDefault()}>{title}</a>
} } }

export const DropdownMenu: Story = { args: { items: [{ title: '홈', href: '#' }, { title: '컴포넌트', href: '#components', menu: componentMenu }, { title: 'Breadcrumb' }] } }

export const ClickTriggeredDropdown: Story = { args: { items: [{ title: '제품', menu: componentMenu, dropdownProps: { trigger: ['click'] } }, { title: '상세' }] } }

export const ControlledDropdown: Story = { render: (args) => <ControlledDropdownStory {...args} /> }

function ControlledDropdownStory(args: BreadcrumbProps) {
  const [open, setOpen] = useState(false)
  const items: BreadcrumbItemType[] = [{ title: '설정', menu: componentMenu, dropdownProps: { open, trigger: ['click'], onOpenChange: setOpen } }, { title: '프로필' }]
  return <div className="story-breadcrumb-stack"><div className="story-toolbar"><button type="button" onClick={() => setOpen((current) => !current)}>{open ? '메뉴 닫기' : '메뉴 열기'}</button><span>현재 상태: {open ? '열림' : '닫힘'}</span></div><Breadcrumb {...args} items={items} /></div>
}

export const CustomDropdownIcon: Story = { args: { dropdownIcon: <span className="story-breadcrumb-more" aria-hidden>•••</span>, items: [{ title: '서비스', menu: componentMenu }, { title: '현재 화면' }] } }

export const PortalAndTopPlacement: Story = { render: (args) => <div className="story-breadcrumb-portal"><Breadcrumb {...args} items={[{ title: '포털 메뉴', menu: componentMenu, dropdownProps: { defaultOpen: true, trigger: ['click'], placement: 'topLeft', getPopupContainer: () => document.body, overlayClassName: 'story-breadcrumb-portal-menu' } }, { title: '현재 페이지' }]} /></div> }

export const DisabledDropdown: Story = { args: { items: [{ title: '사용 가능한 경로', href: '#' }, { title: '비활성 메뉴', menu: componentMenu, dropdownProps: { disabled: true } }, { title: '현재 페이지' }] } }

export const SemanticClassNamesAndStyles: Story = { args: { classNames: ({ props }) => ({ root: props.separator === '•' ? 'story-breadcrumb-root' : '', item: 'story-breadcrumb-item', separator: 'story-breadcrumb-separator' }), styles: { root: { padding: 12 }, item: { fontWeight: 500 }, separator: { marginInline: 12 } }, separator: '•' } }

export const NativeNavigationProps: Story = { args: { 'aria-label': '프로젝트 내 현재 위치', 'data-surface': 'project-navigation', className: 'story-breadcrumb-native', rootClassName: 'story-breadcrumb-root-class', style: { maxWidth: 720 } } }

export const LegacyRoutes: Story = { args: { items: undefined, routes: [{ title: '홈', href: '#' }, { breadcrumbName: '레거시 breadcrumbName' }, { title: '현재 페이지' }] } }

export const LegacyChildrenComposition: Story = { render: () => <Breadcrumb separator="/"><Breadcrumb.Item href="#">홈</Breadcrumb.Item><Breadcrumb.Item href="#components">컴포넌트</Breadcrumb.Item><Breadcrumb.Separator>:</Breadcrumb.Separator><Breadcrumb.Item>Breadcrumb</Breadcrumb.Item></Breadcrumb> }

export const LegacyChildrenMenu: Story = { args: { items: [{ title: '홈', href: '#' }, { title: '컴포넌트', children: [{ title: 'General', path: '/general' }, { title: 'Navigation', path: '/navigation' }] }, { title: 'Breadcrumb' }] } }

export const ResponsiveLongTrail: Story = { args: { items: Array.from({ length: 9 }, (_, index) => ({ key: index, title: index === 8 ? '현재 상세 페이지' : `경로 ${index + 1}`, href: index === 8 ? undefined : `#level-${index + 1}` })) }, parameters: { viewport: { defaultViewport: 'mobile1' } } }

export const MenuCallbacks: Story = { render: () => <MenuCallbacksStory /> }

function MenuCallbacksStory() {
  const [message, setMessage] = useState('메뉴 항목을 선택하세요.')
  return <div className="story-breadcrumb-stack"><p className="story-hint">{message}</p><Breadcrumb items={[{ title: '작업', menu: { onClick: ({ key }) => setMessage(`menu.onClick: ${String(key)}`), items: [{ key: 'duplicate', label: '복제' }, { key: 'archive', label: '보관' }, { key: 'delete', label: '삭제', danger: true }] }, dropdownProps: { trigger: ['click'], onOpenChange: (open, info) => { if (open) setMessage(`onOpenChange: ${info.source}에서 열림`) } } }, { title: '문서' }]} /></div>
}

export const ItemClickAndAttributes: Story = { render: () => <ItemClickStory /> }

function ItemClickStory() {
  const [message, setMessage] = useState('첫 경로를 클릭해 onClick을 확인하세요.')
  return <div className="story-breadcrumb-stack"><p className="story-hint">{message}</p><Breadcrumb items={[{ title: '클릭 가능한 경로', href: '#click', className: 'story-breadcrumb-accent', style: { fontWeight: 600 }, 'aria-label': '클릭 이벤트 경로', 'data-route-id': 'clickable', onClick: (event) => { event.preventDefault(); setMessage('route.onClick 호출됨') } }, { title: '현재 페이지' }]} /></div>
}

export const GenericParamsTyping: Story = { render: () => {
  const props: BreadcrumbProps<{ workspace: string; issue: number }> = { params: { workspace: 'design', issue: 381 }, items: [{ title: ':workspace', path: ':workspace' }, { title: '이슈 :issue', path: 'issues/:issue' }] }
  return <Breadcrumb {...props} />
} }

export const Empty: Story = { args: { items: [] } }
