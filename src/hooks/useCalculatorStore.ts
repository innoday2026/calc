import { useMemo, useSyncExternalStore } from 'react';
import { CalculatorStore, type DisplayState } from '@/store';

export function useCalculatorStore(): { store: CalculatorStore; displayState: DisplayState } {
  const store = useMemo(() => new CalculatorStore(), []);
  const displayState = useSyncExternalStore(store.subscribe, store.getDisplayState);
  return { store, displayState };
}
