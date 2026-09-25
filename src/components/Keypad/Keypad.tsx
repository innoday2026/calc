import type { CalculatorStore, Operator } from '@/store';
import styles from './Keypad.module.css';

export interface KeypadProps {
  store: CalculatorStore;
}

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'] as const;
const OPERATORS: Operator[] = ['+', '-', '*', '/'];

export function Keypad({ store }: KeypadProps) {
  return (
    <div className={styles.keypad}>
      {DIGITS.map((digit) => (
        <button
          key={digit}
          type="button"
          aria-label={digit}
          onClick={() => store.inputDigit(digit)}
        >
          {digit}
        </button>
      ))}
      {OPERATORS.map((operator) => (
        <button
          key={operator}
          type="button"
          aria-label={operator}
          onClick={() => store.inputOperator(operator)}
        >
          {operator}
        </button>
      ))}
      <button type="button" aria-label="all clear" onClick={() => store.reset()}>
        AC/C
      </button>
      <button type="button" aria-label="equals" onClick={() => store.evaluate()}>
        =
      </button>
    </div>
  );
}
