import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { INITIAL_DISPLAY_STATE } from '@/store';
import { Display } from './Display';

describe('Display', () => {
  it('renders "0" for the initial state (FR-001)', () => {
    render(<Display displayState={INITIAL_DISPLAY_STATE} />);
    expect(screen.getByTestId('primary-display')).toHaveTextContent('0');
    expect(screen.getByTestId('secondary-display')).toHaveTextContent('');
  });

  it('renders the secondary expression above the primary value (FR-007)', () => {
    render(
      <Display
        displayState={{ primaryValue: '5', secondaryExpression: '2 + 3', isResult: true }}
      />,
    );
    expect(screen.getByTestId('secondary-display')).toHaveTextContent('2 + 3');
    expect(screen.getByTestId('primary-display')).toHaveTextContent('5');
  });

  it('announces updates politely', () => {
    render(<Display displayState={INITIAL_DISPLAY_STATE} />);
    const primary = screen.getByTestId('primary-display');
    expect(primary).toHaveAttribute('aria-live', 'polite');
    expect(primary).toHaveAttribute('aria-atomic', 'true');
  });
});
