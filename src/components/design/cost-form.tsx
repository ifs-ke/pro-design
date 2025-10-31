"use client";

import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@/store/cost-store";
import type { Calculations, FormValues } from "@/store/types";
import { formSchema } from "@/store/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientProjectSection } from "./costing/client-project-section";
import { MaterialsSection } from "./costing/materials-section";
import { LaborSection } from "./costing/labor-section";
import { OperationsSection } from "./costing/operations-section";
import { AffiliatesSection } from "./costing/affiliates-section";
import { SummarySection } from "./costing/summary-section";

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
          {loadedQuoteId ? `Editing Quote: ${loadedQuoteId}` : 'Enter the core costs of your project to get started.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
            <ClientProjectSection />
            <div className="space-y-4">
                <MaterialsSection />
                <LaborSection />
                <OperationsSection calculations={calculations} />
                <AffiliatesSection />
            </div>
            <SummarySection calculations={calculations} />
        </form>
      </CardContent>
    </Card>
  );
}
