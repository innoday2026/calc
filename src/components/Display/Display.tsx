import type { DisplayState } from '@/store';
import styles from './Display.module.css';

export interface DisplayProps {
  displayState: DisplayState;
}

export function Display({ displayState }: DisplayProps) {
  return (
    <div className={styles.display}>
      <div className={styles.secondary} data-testid="secondary-display">
        {displayState.secondaryExpression}
      </div>
      <output
        className={styles.primary}
        data-testid="primary-display"
        aria-live="polite"
        aria-atomic="true"
      >
        {displayState.primaryValue}
      </output>
    </div>
  );
}
