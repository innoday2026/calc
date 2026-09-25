export type Operator = '+' | '-' | '*' | '/';

/** Text shown on the primary line while the calculator is in the error state. */
export const ERROR_DISPLAY_VALUE = 'Error';

export interface DisplayState {
  /** Number or result currently shown on the primary line. */
  primaryValue: string;
  /** Expression or previous operand shown above the primary line; empty when unset. */
  secondaryExpression: string;
  /** True when primaryValue is a computed result rather than active input. */
  isResult: boolean;
  /** True while the calculator is in the error state and ignores input until cleared. */
  isError: boolean;
}

export const INITIAL_DISPLAY_STATE: DisplayState = {
  primaryValue: '0',
  secondaryExpression: '',
  isResult: false,
  isError: false,
};
