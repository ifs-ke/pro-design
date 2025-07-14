
'use client'

import { useState, useEffect } from 'react';
import { useStore } from '@/store/cost-store';

export const useIsHydrated = () => {
  const isHydrated = useStore((state) => state._hydrated);
  return isHydrated;
};
