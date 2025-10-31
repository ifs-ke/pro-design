'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/cost-store';
import type { Calculations, FormValues } from '@/store/types';
import { useIsHydrated } from '@/hooks/use-hydrated-store';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from '@/store/types';

import { CostForm } from '@/components/design/cost-form';
import { ProfitAllocator } from '@/components/design/profit-allocator';
import { ProjectQuote } from '@/components/design/project-quote';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CostingPage() {
  const {
    formValues,
    setFormValues,
    resetForm,
    isPublishing,
    calculate,
  } = useStore();
  const isLoading = !useIsHydrated();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // The form is now uncontrolled internally by react-hook-form,
    // which is more performant for complex forms.
    defaultValues: formValues, // Initialize with store's values
  });

  // Effect to reset the form when the store's formValues change
  // (e.g. loading a quote).
  useEffect(() => {
    form.reset(formValues);
  }, [formValues, form]);

  // Effect to subscribe to form changes and sync them to the Zustand store
  // with a debounce.
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        setFormValues(value as FormValues);
      }, 300); // 300ms debounce
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [form, setFormValues]);


  const calculations: Calculations = calculate(formValues);

  const handleNewQuoteClick = () => {
    setResetDialogOpen(true);
  };

  const handleConfirmReset = () => {
    resetForm();
    setResetDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-lg'>Loading Costing Tool...</div>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <header className='mb-8 flex flex-col sm:flex-row justify-between items-start gap-4'>
        <div>
          <h1 className='text-4xl lg:text-5xl font-bold text-foreground tracking-tight'>
            Costing Tool
          </h1>
          <p className='text-muted-foreground mt-2 text-lg'>
            Your all-in-one pricing tool for interior design projects.
          </p>
        </div>
        <Button
          onClick={handleNewQuoteClick}
          variant='outline'
          disabled={isPublishing}
        >
          <RefreshCcw className='mr-2' />
          Start New Quote
        </Button>
      </header>

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 items-start'>
        <div className='lg:col-span-3 space-y-8'>
          <CostForm calculations={calculations} />
        </div>

        <div className='lg:col-span-2 space-y-8'>
          <div className='sticky top-8 space-y-8'>
            <ProfitAllocator profitAmount={calculations.profitAmount} />
            <ProjectQuote calculations={calculations} />
          </div>
        </div>
      </div>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all the current form data. Your saved quotes will
              not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
}
