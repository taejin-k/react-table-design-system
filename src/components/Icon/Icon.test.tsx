import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Icon } from './Icon';

describe('Icon', () => {
  it.each(['Enter', ' '])('activates with %s', async (key) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Icon icon="delete" aria-label="삭제" onClick={onClick} />);

    screen.getByRole('button', { name: '삭제' }).focus();
    await user.keyboard(key === 'Enter' ? '{Enter}' : ' ');
    expect(onClick).toHaveBeenCalledOnce();
  });
});
