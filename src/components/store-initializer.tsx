'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/cost-store';
import type { Client, Property, Project, Quote } from '@/store/cost-store';

interface StoreInitializerProps {
  clients: Client[];
  properties: Property[];
  projects: Project[];
  quotes: Quote[];
}

function StoreInitializer({ clients, properties, projects, quotes }: StoreInitializerProps) {
  // The useEffect hook ensures that this side effect (updating the store)
  // runs after the component has mounted, not during the render.
  // The empty dependency array [] ensures it only runs once.
  useEffect(() => {
    useStore.getState().setData({ clients, properties, projects, quotes });
    useStore.getState().setHydrated(); // Signal that hydration is complete
  }, []);

  return null;
}

export default StoreInitializer;
