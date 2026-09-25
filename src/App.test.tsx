import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App display integration', () => {
  it('shows "0" on load and renders digits as they are pressed (FR-001, FR-002, FR-003)', async () => {
    const user = userEvent.setup();
    render(<App />);
    const primary = screen.getByTestId('primary-display');
    expect(primary).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: '5' }));
    expect(primary).toHaveTextContent('5');

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(primary).toHaveTextContent('53');
  });

  it('shows the result and the expression after equals (FR-005, FR-007)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: '3' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));

    expect(screen.getByTestId('primary-display')).toHaveTextContent('5');
    expect(screen.getByTestId('secondary-display')).toHaveTextContent('2 + 3');
  });

  it('updates the display within 100 ms of a digit press (TC-011, FR-004, SC-002)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const start = performance.now();
    await user.click(screen.getByRole('button', { name: '7' }));
    const elapsed = performance.now() - start;

    expect(screen.getByTestId('primary-display')).toHaveTextContent('7');
    expect(elapsed).toBeLessThan(100);
  });
});

describe('App error state and clear', () => {
  it('shows "Error" for 5 ÷ 0 and ignores further input until cleared (FR-002, FR-004, FR-005)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: '/' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));

    const primary = screen.getByTestId('primary-display');
    expect(primary).toHaveTextContent('Error');

    await user.click(screen.getByRole('button', { name: '9' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));
    expect(primary).toHaveTextContent('Error');
  });

  it('recovers from the error state via AC/C and calculates again (FR-006, FR-009)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '8' }));
    await user.click(screen.getByRole('button', { name: '/' }));
    await user.click(screen.getByRole('button', { name: '0' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));
    await user.click(screen.getByRole('button', { name: 'all clear' }));

    expect(screen.getByTestId('primary-display')).toHaveTextContent('0');
    expect(screen.getByTestId('secondary-display')).toHaveTextContent('');

    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'equals' }));
    expect(screen.getByTestId('primary-display')).toHaveTextContent('9');
  });

  it('clears pending operators and operands mid-entry (FR-007, FR-010)', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '1' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: '+' }));
    await user.click(screen.getByRole('button', { name: '7' }));
    await user.click(screen.getByRole('button', { name: 'all clear' }));

    expect(screen.getByTestId('primary-display')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'equals' }));
    expect(screen.getByTestId('primary-display')).toHaveTextContent('0');
    expect(screen.getByTestId('secondary-display')).toHaveTextContent('');
  });
});
