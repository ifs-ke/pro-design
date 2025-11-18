'use client';

import { useFormContext } from 'react-hook-form';
import { useStore } from '@/store/cost-store';
import type { Calculations, FormValues } from '@/store/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MaterialsSection } from './costing/materials-section';
import { LaborSection } from './costing/labor-section';
import { OperationsSection } from './costing/operations-section';
import { AffiliatesSection } from './costing/affiliates-section';
import { SummarySection } from './costing/summary-section';
import { ClientSelector } from './client-selector';
import { ProjectSelector } from './project-selector';
import { SalariesSection } from './costing/salaries-section';

interface CostFormProps {
  calculations: Calculations;
}

export function CostForm({ calculations }: CostFormProps) {
  const loadedQuoteId = useStore((state) => state.loadedQuoteId);
  const form = useFormContext<FormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Costing</CardTitle>
        <CardDescription>
          {loadedQuoteId
            ? `Editing Quote: ${loadedQuoteId}`
            : 'Enter the core costs of your project to get started.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <ClientSelector />
          <ProjectSelector />
          <div className="space-y-4">
            <MaterialsSection calculations={calculations} />
            <LaborSection calculations={calculations} />
            <SalariesSection calculations={calculations} />
            <OperationsSection calculations={calculations} />
            <AffiliatesSection calculations={calculations} />
          </div>
          <SummarySection calculations={calculations} />
        </form>
      </CardContent>
    </Card>
  );
}
