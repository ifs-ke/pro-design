'use client';

import { useRef } from 'react';
import { useStore } from '@/store/cost-store';
import type { Client, Property, Project, Quote } from '@/store/cost-store';

interface StoreInitializerProps {
  clients: Client[];
  properties: Property[];
  projects: Project[];
  quotes: Quote[];
}

function StoreInitializer({ clients, properties, projects, quotes }: StoreInitializerProps) {
  const initialized = useRef(false);
  if (!initialized.current) {
    useStore.getState().setData({ clients, properties, projects, quotes });
    initialized.current = true;
  }
  return null;
}

export default StoreInitializer;
