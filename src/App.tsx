import { Display } from '@/components/Display/Display';
import { Keypad } from '@/components/Keypad/Keypad';
import { useCalculatorStore } from '@/hooks/useCalculatorStore';
import styles from './App.module.css';

export function App() {
  const { store, displayState } = useCalculatorStore();

  return (
    <main className={styles.app}>
      <h1 className={styles.title}>Calculator</h1>
      <Display displayState={displayState} />
      <Keypad store={store} />
    </main>
  );
}
