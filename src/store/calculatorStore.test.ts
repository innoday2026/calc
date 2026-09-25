import { describe, expect, it } from 'vitest';
import { CalculatorStore } from './calculatorStore';

describe('CalculatorStore', () => {
  it('starts with "0" and isResult false (TC-001, FR-001)', () => {
    const store = new CalculatorStore();
    expect(store.getDisplayState()).toEqual({
      primaryValue: '0',
      secondaryExpression: '',
      isResult: false,
      isError: false,
    });
  });

  it('replaces the leading zero with the pressed digit (TC-002, FR-002)', () => {
    const store = new CalculatorStore();
    store.inputDigit('5');
    expect(store.getDisplayState().primaryValue).toBe('5');
  });

  it('appends digits during active entry (TC-003, FR-003)', () => {
    const store = new CalculatorStore();
    store.inputDigit('1');
    store.inputDigit('2');
    store.inputDigit('3');
    expect(store.getDisplayState().primaryValue).toBe('123');
  });

  it('does not create a leading double zero (TC-004, EC-001)', () => {
    const store = new CalculatorStore();
    store.inputDigit('0');
    expect(store.getDisplayState().primaryValue).toBe('0');
  });

  it('starts a new number after a result (TC-005, FR-006, EC-002)', () => {
    const store = new CalculatorStore();
    store.inputDigit('4');
    store.inputDigit('2');
    store.inputOperator('+');
    store.inputDigit('0');
    store.evaluate();
    store.inputDigit('7');
    expect(store.getDisplayState().primaryValue).toBe('7');
    expect(store.getDisplayState().isResult).toBe(false);
  });

  it('shows the computed result after evaluate (TC-006, FR-005)', () => {
    const store = new CalculatorStore();
    store.inputDigit('2');
    store.inputOperator('+');
    store.inputDigit('3');
    store.evaluate();
    expect(store.getDisplayState().primaryValue).toBe('5');
    expect(store.getDisplayState().isResult).toBe(true);
  });

  it('shows the evaluated expression on the secondary line (TC-007, FR-007)', () => {
    const store = new CalculatorStore();
    store.inputDigit('2');
    store.inputOperator('+');
    store.inputDigit('3');
    store.evaluate();
    expect(store.getDisplayState().secondaryExpression).toBe('2 + 3');
  });

  it('clears the secondary line when a new expression begins (TC-008, FR-008)', () => {
    const store = new CalculatorStore();
    store.inputDigit('2');
    store.inputOperator('+');
    store.inputDigit('3');
    store.evaluate();
    store.inputDigit('1');
    expect(store.getDisplayState().secondaryExpression).toBe('');
  });

  it('keeps state unchanged when evaluate is pressed on a result (TC-009, EC-003)', () => {
    const store = new CalculatorStore();
    store.inputDigit('2');
    store.inputOperator('+');
    store.inputDigit('3');
    store.evaluate();
    const before = store.getDisplayState();
    store.evaluate();
    expect(store.getDisplayState()).toEqual(before);
  });

  it('preserves state when no action is taken (TC-010, FR-009)', () => {
    const store = new CalculatorStore();
    expect(store.getDisplayState()).toEqual(store.getDisplayState());
    expect(store.getDisplayState().primaryValue).toBe('0');
  });

  it('starts a fresh operand after an operator and shows the pending expression', () => {
    const store = new CalculatorStore();
    store.inputDigit('9');
    store.inputOperator('-');
    expect(store.getDisplayState().secondaryExpression).toBe('9 -');
    store.inputDigit('4');
    expect(store.getDisplayState().primaryValue).toBe('4');
    store.evaluate();
    expect(store.getDisplayState().primaryValue).toBe('5');
  });

  it('notifies subscribers and supports unsubscribe', () => {
    const store = new CalculatorStore();
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });
    store.inputDigit('1');
    unsubscribe();
    store.inputDigit('2');
    expect(calls).toBe(1);
  });

  it('clears the secondary expression on demand and resets to initial state', () => {
    const store = new CalculatorStore();
    store.inputDigit('8');
    store.inputOperator('*');
    store.clearSecondaryExpression();
    expect(store.getDisplayState().secondaryExpression).toBe('');
    store.reset();
    expect(store.getDisplayState()).toEqual({
      primaryValue: '0',
      secondaryExpression: '',
      isResult: false,
      isError: false,
    });
  });
});

describe('CalculatorStore error state', () => {
  const divideByZero = (store: CalculatorStore): void => {
    store.inputDigit('5');
    store.inputOperator('/');
    store.inputDigit('0');
    store.evaluate();
  };

  it('shows "Error" without throwing when dividing by zero (TC-001, TC-002, FR-001, FR-002, FR-003)', () => {
    const store = new CalculatorStore();
    expect(() => divideByZero(store)).not.toThrow();
    expect(store.getDisplayState().primaryValue).toBe('Error');
    expect(store.getDisplayState().isError).toBe(true);
    expect(store.getDisplayState().isResult).toBe(false);
  });

  it('ignores digits while in the error state (TC-003, FR-004)', () => {
    const store = new CalculatorStore();
    divideByZero(store);
    const before = store.getDisplayState();
    store.inputDigit('7');
    expect(store.getDisplayState()).toEqual(before);
  });

  it('ignores operators and equals while in the error state (TC-004, FR-005)', () => {
    const store = new CalculatorStore();
    divideByZero(store);
    const before = store.getDisplayState();
    store.inputOperator('+');
    store.evaluate();
    expect(store.getDisplayState()).toEqual(before);
  });

  it('resets fully from the error state on clear (TC-005, FR-006, FR-010)', () => {
    const store = new CalculatorStore();
    divideByZero(store);
    store.reset();
    expect(store.getDisplayState()).toEqual({
      primaryValue: '0',
      secondaryExpression: '',
      isResult: false,
      isError: false,
    });
  });

  it('resets fully from mid-input state on clear (TC-006, FR-007)', () => {
    const store = new CalculatorStore();
    store.inputDigit('1');
    store.inputDigit('2');
    store.inputOperator('+');
    store.inputDigit('7');
    store.reset();
    expect(store.getDisplayState()).toEqual({
      primaryValue: '0',
      secondaryExpression: '',
      isResult: false,
      isError: false,
    });
    store.evaluate();
    expect(store.getDisplayState().primaryValue).toBe('0');
  });

  it('resets fully from the result state on clear (TC-007, FR-008)', () => {
    const store = new CalculatorStore();
    store.inputDigit('6');
    store.inputOperator('*');
    store.inputDigit('7');
    store.evaluate();
    store.reset();
    expect(store.getDisplayState()).toEqual({
      primaryValue: '0',
      secondaryExpression: '',
      isResult: false,
      isError: false,
    });
  });

  it('accepts input again after clearing the error state (TC-008, FR-009)', () => {
    const store = new CalculatorStore();
    divideByZero(store);
    store.reset();
    store.inputDigit('3');
    store.inputOperator('*');
    store.inputDigit('4');
    store.evaluate();
    expect(store.getDisplayState().primaryValue).toBe('12');
    expect(store.getDisplayState().isError).toBe(false);
  });

  it('divides normally when the divisor is non-zero', () => {
    const store = new CalculatorStore();
    store.inputDigit('9');
    store.inputOperator('/');
    store.inputDigit('3');
    store.evaluate();
    expect(store.getDisplayState().primaryValue).toBe('3');
    expect(store.getDisplayState().isError).toBe(false);
  });
});
