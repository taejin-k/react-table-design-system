import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Foundations/Design Tokens',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const colors = [
  ['Primary', '#1677ff', '--orbit-color-primary'],
  ['Primary hover', '#4096ff', '--orbit-color-primary-hover'],
  ['Text', 'rgba(0, 0, 0, 0.88)', '--orbit-color-text'],
  ['Secondary text', 'rgba(0, 0, 0, 0.65)', '--orbit-color-text-secondary'],
  ['Container', '#ffffff', '--orbit-color-bg-container'],
  ['Header fill', '#fafafa', '--orbit-color-fill-alter'],
  ['Border', '#d9d9d9', '--orbit-color-border'],
  ['Split border', '#f0f0f0', '--orbit-color-border-secondary'],
]

export const Overview: Story = {
  render: () => <main className="token-page"><div><p className="token-eyebrow">ORBIT DESIGN SYSTEM</p><h1>Design tokens</h1><p>Ant Design의 시각 리듬과 호환되는 독립 CSS 변수 세트입니다.</p></div><section><h2>Colors</h2><div className="token-grid">{colors.map(([name, value, token]) => <article key={token}><div className="token-swatch" style={{ background: value }} /><strong>{name}</strong><code>{token}</code><span>{value}</span></article>)}</div></section><section><h2>Foundation</h2><div className="token-foundations"><article><strong>Typography</strong><span>14px / 1.5715</span><code>--orbit-font-family</code></article><article><strong>Radius</strong><span>6px · 8px</span><code>--orbit-border-radius</code></article><article><strong>Motion</strong><span>100ms · 200ms</span><code>--orbit-motion-duration-mid</code></article></div></section></main>,
}
