import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Table } from './Table';
import type { ColumnsType } from './Table.types';

type Row = { key: string; name: string; team: string };
const data: Row[] = [{ key: '1', name: '김민준', team: 'Design' }];

describe('Table regressions', () => {
  it('renders multiple anonymous column groups without duplicate-key errors', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const columns: ColumnsType<Row> = [
      { title: '사용자', children: [{ title: '이름', dataIndex: 'name' }] },
      { title: '소속', children: [{ title: '팀', dataIndex: 'team' }] },
    ];

    render(<Table columns={columns} dataSource={data} pagination={false} />);
    expect(screen.getByText('사용자')).toBeInTheDocument();
    expect(consoleError.mock.calls.flat().join(' ')).not.toContain('same key');
    consoleError.mockRestore();
  });

  it('closes the selection menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<Table columns={[{ title: '이름', dataIndex: 'name' }]} dataSource={data} rowSelection={{ selections: true }} pagination={false} />);

    await user.click(screen.getByRole('button', { name: '선택 작업' }));
    expect(screen.getByRole('menu', { name: '선택 작업 메뉴' })).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole('menu', { name: '선택 작업 메뉴' })).not.toBeInTheDocument();
  });

  it('opens the selection menu with ArrowDown and focuses its first item', async () => {
    const user = userEvent.setup();
    render(<Table columns={[{ title: '이름', dataIndex: 'name' }]} dataSource={data} rowSelection={{ selections: true }} pagination={false} />);

    const trigger = screen.getByRole('button', { name: '선택 작업' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('moves focus into a selection menu that was opened by click', async () => {
    const user = userEvent.setup();
    render(<Table columns={[{ title: '이름', dataIndex: 'name' }]} dataSource={data} rowSelection={{ selections: true }} pagination={false} />);

    const trigger = screen.getByRole('button', { name: '선택 작업' });
    await user.click(trigger);
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
  });
});
