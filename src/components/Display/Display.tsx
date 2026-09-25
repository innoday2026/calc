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
        className={displayState.isError ? `${styles.primary} ${styles.error}` : styles.primary}
        data-testid="primary-display"
        data-error={displayState.isError ? 'true' : undefined}
        aria-live="polite"
        aria-atomic="true"
      >
        {displayState.primaryValue}
      </output>
    </div>
  );
}
