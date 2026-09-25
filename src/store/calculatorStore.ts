import { applyOperator } from '@/engine';
import { INITIAL_DISPLAY_STATE, type DisplayState, type Operator } from './types';

type Listener = () => void;

export class CalculatorStore {
  private state: DisplayState = INITIAL_DISPLAY_STATE;
  private pendingOperand: string | null = null;
  private pendingOperator: Operator | null = null;
  private awaitingOperand = false;
  private listeners = new Set<Listener>();

  getDisplayState = (): DisplayState => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  inputDigit(digit: string): void {
    if (this.state.isResult || this.awaitingOperand) {
      this.awaitingOperand = false;
      this.setState({
        primaryValue: digit,
        secondaryExpression: this.state.isResult ? '' : this.state.secondaryExpression,
        isResult: false,
      });
      return;
    }

    if (this.state.primaryValue === '0') {
      this.setState({ ...this.state, primaryValue: digit });
      return;
    }

    this.setState({ ...this.state, primaryValue: this.state.primaryValue + digit });
  }

  inputOperator(operator: Operator): void {
    this.pendingOperand = this.state.primaryValue;
    this.pendingOperator = operator;
    this.awaitingOperand = true;
    this.setState({
      ...this.state,
      secondaryExpression: `${this.state.primaryValue} ${operator}`,
      isResult: false,
    });
  }

  evaluate(): void {
    if (this.pendingOperand === null || this.pendingOperator === null) {
      return;
    }

    const expression = `${this.pendingOperand} ${this.pendingOperator} ${this.state.primaryValue}`;
    const result = applyOperator(
      Number(this.pendingOperand),
      this.pendingOperator,
      Number(this.state.primaryValue),
    );

    this.pendingOperand = null;
    this.pendingOperator = null;
    this.awaitingOperand = false;
    this.setState({
      primaryValue: String(result),
      secondaryExpression: expression,
      isResult: true,
    });
  }

  clearSecondaryExpression(): void {
    this.setState({ ...this.state, secondaryExpression: '' });
  }

  reset(): void {
    this.pendingOperand = null;
    this.pendingOperator = null;
    this.awaitingOperand = false;
    this.setState(INITIAL_DISPLAY_STATE);
  }

  private setState(next: DisplayState): void {
    this.state = next;
    this.listeners.forEach((listener) => listener());
  }
}
