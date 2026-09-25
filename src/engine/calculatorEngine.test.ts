import { describe, expect, it } from 'vitest';
import { applyOperator } from './calculatorEngine';

describe('applyOperator', () => {
  it('adds', () => expect(applyOperator(2, '+', 3)).toBe(5));
  it('subtracts', () => expect(applyOperator(9, '-', 4)).toBe(5));
  it('multiplies', () => expect(applyOperator(3, '*', 4)).toBe(12));
  it('divides', () => expect(applyOperator(10, '/', 4)).toBe(2.5));
});
