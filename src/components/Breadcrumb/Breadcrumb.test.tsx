import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('renders one item and four or more items without extra separators', () => {
    const { rerender } = render(<Breadcrumb items={[{ title: '홈' }]} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('홈');
    expect(screen.getByRole('list').children).toHaveLength(1);

    rerender(<Breadcrumb items={[{ title: '홈' }, { title: '프로젝트' }, { title: '컴포넌트' }, { title: 'Breadcrumb' }]} />);
    expect(screen.getByRole('list').children).toHaveLength(4);
    expect(screen.getByRole('navigation')).toHaveTextContent('홈/프로젝트/컴포넌트/Breadcrumb');
  });

  it('renders href items as links and calls their click handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    render(<Breadcrumb items={[{ title: '홈', href: '/home', onClick }, { title: '현재 위치' }]} />);

    const link = screen.getByRole('link', { name: '홈' });
    expect(link).toHaveAttribute('href', '/home');
    expect(link.className).toContain('hover:bg-[#f5f5f5]');
    await user.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies icon and color to each item', () => {
    render(
      <Breadcrumb
        items={[
          { title: '홈', icon: <svg data-testid="home-icon" />, color: '#0062df' },
          { title: '현재 위치', color: '#d92626' },
        ]}
      />,
    );

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    expect(screen.getByText('홈').parentElement).toHaveStyle({ color: '#0062df' });
    expect(screen.getByText('현재 위치').parentElement).toHaveStyle({ color: '#d92626' });
  });
});
