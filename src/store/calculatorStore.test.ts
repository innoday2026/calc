import { describe, expect, it } from 'vitest';
import { CalculatorStore } from './calculatorStore';

describe('CalculatorStore', () => {
  it('starts with "0" and isResult false (TC-001, FR-001)', () => {
    const store = new CalculatorStore();
    expect(store.getDisplayState()).toEqual({
      primaryValue: '0',
      secondaryExpression: '',
      isResult: false,
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
    });
  });
});
