
"use client";

import { useEffect, useMemo } from "react";
import { useStore, type Calculations, performCalculations, FormValues } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/components/design/cost-form";


import { CostForm } from "@/components/design/cost-form";
import { ProfitAllocator } from "@/components/design/profit-allocator";
import { ProjectQuote } from "@/components/design/project-quote";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

export default function CostingPage() {
  const { formValues, setFormValues, resetForm, loadedQuoteId } = useStore();
  const isLoading = !useIsHydrated();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: formValues, // Use `values` to make the form controlled by the Zustand store
  });

  const watchedFormValues = form.watch();
  
  // This effect syncs the form state back to the Zustand store on any change.
  useEffect(() => {
    setFormValues(watchedFormValues);
  }, [watchedFormValues, setFormValues]);

  // When a quote is loaded, Zustand updates formValues, and we reset the form
  // to ensure react-hook-form is in sync with the new state.
  useEffect(() => {
    form.reset(formValues);
  }, [loadedQuoteId, form, formValues]);

  // Derive calculations directly from the store's state for reactivity.
  const calculations: Calculations = useMemo(() => performCalculations(formValues), [formValues]);

  const handleNewQuote = () => {
    resetForm();
  }

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Costing Tool...</div>
        </div>
    );
  }

  return (
    <FormProvider {...form}>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Costing Tool
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
            Your all-in-one pricing tool for interior design projects.
            </p>
        </div>
        <Button onClick={handleNewQuote} variant="outline">
            <RefreshCcw className="mr-2"/>
            Start New Quote
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
          <CostForm calculations={calculations} />
        </div>

        <div className="lg:col-span-2 space-y-8 sticky top-8">
          <ProfitAllocator profit={calculations.profit} />
          <ProjectQuote calculations={calculations} />
        </div>
      </div>
    </FormProvider>
  );
}
