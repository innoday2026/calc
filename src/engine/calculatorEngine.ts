import type { Operator } from '@/store/types';

export type EvaluationResult =
  | { type: 'numeric'; value: number }
  | { type: 'error'; reason: 'division-by-zero' };

export function applyOperator(left: number, operator: Operator, right: number): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
  }
}

export function evaluateOperation(
  left: number,
  operator: Operator,
  right: number,
): EvaluationResult {
  if (operator === '/' && right === 0) {
    return { type: 'error', reason: 'division-by-zero' };
  }

  return { type: 'numeric', value: applyOperator(left, operator, right) };
}
