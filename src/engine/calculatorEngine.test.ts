import { describe, expect, it } from 'vitest';
import { applyOperator, evaluateOperation } from './calculatorEngine';

describe('applyOperator', () => {
  it('adds', () => expect(applyOperator(2, '+', 3)).toBe(5));
  it('subtracts', () => expect(applyOperator(9, '-', 4)).toBe(5));
  it('multiplies', () => expect(applyOperator(3, '*', 4)).toBe(12));
  it('divides', () => expect(applyOperator(10, '/', 4)).toBe(2.5));
});

describe('evaluateOperation', () => {
  it('returns a numeric result for valid operations', () =>
    expect(evaluateOperation(10, '/', 4)).toEqual({ type: 'numeric', value: 2.5 }));

  it('returns an error for division by zero (FR-001)', () =>
    expect(evaluateOperation(5, '/', 0)).toEqual({ type: 'error', reason: 'division-by-zero' }));

  it('treats zero as a valid operand for other operators', () =>
    expect(evaluateOperation(5, '+', 0)).toEqual({ type: 'numeric', value: 5 }));
});
