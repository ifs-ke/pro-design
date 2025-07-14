
'use client'

import { useState, useEffect } from 'react';
import { useStore } from '@/store/cost-store';
import type { CostState } from '@/store/cost-store';

// We create a separate hook for getting hydrated data to avoid re-rendering loops
// and handle hydration mismatch.
export const useHydratedStore = <T,>(
  selector: (state: CostState) => T,
  equals?: (a: T, b: T) => boolean
): T => {
  const store = useStore(selector, equals);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);
  
  // Return the default value on the server and until the store is hydrated on the client.
  const defaultValue = selector(useStore.getState());
  
  // Once hydrated, return the live store value.
  return hydrated ? store : defaultValue;
};
