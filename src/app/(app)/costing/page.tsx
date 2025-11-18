'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/cost-store';
import type { Calculations, FormValues } from '@/store/types';
import { useIsHydrated } from '@/hooks/use-hydrated-store';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from '@/store/types';
import { useToast } from '@/hooks/use-toast';

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
import { OverviewSection } from '@/components/design/costing/overview-section';

export default function CostingPage() {
  const {
    formValues,
    allocations,
    resetForm,
    isPublishing,
    calculate,
    publishQuote,
    loadedQuoteId,
  } = useStore(state => ({ 
      formValues: state.formValues,
      allocations: state.allocations,
      resetForm: state.resetForm,
      isPublishing: state.isPublishing,
      calculate: state.calculate,
      publishQuote: state.publishQuote,
      loadedQuoteId: state.loadedQuoteId
    }));
    
  const isLoading = !useIsHydrated();
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formValues,
  });

  useEffect(() => {
    form.reset(formValues);
  }, [formValues, form]);

  const watchedFormValues = form.watch();
  const calculations: Calculations = calculate(watchedFormValues);
  const isClientSelected = watchedFormValues.clientId && watchedFormValues.clientId.length > 0;

  const handleNewQuoteClick = () => {
    setResetDialogOpen(true);
  };

  const handleConfirmReset = () => {
    resetForm();
    setResetDialogOpen(false);
  };
  
  const handlePublish = async (finalQuotePrice: number) => {
    const suggestedCalculations = calculate(watchedFormValues);
    const finalCalculations: Calculations = { ...suggestedCalculations, totalPrice: finalQuotePrice };

    const result = await publishQuote(
      watchedFormValues,
      allocations,
      finalCalculations,
      suggestedCalculations,
      loadedQuoteId
    );

    if (result) {
        toast({
            title: `Quote ${result.wasExisting ? 'Updated' : 'Published'}!`,
            description: `Quote ID: ${result.quoteId} has been successfully ${result.wasExisting ? 'updated' : 'saved'}.`,
        });
        resetForm();
    } else {
        toast({
            title: 'Uh oh! Something went wrong.',
            description: 'There was a problem with your request. Please try again',
            variant: 'destructive',
        });
    }
  }

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
          <h1 className='text-3xl sm:text-4xl font-bold text-foreground tracking-tight'>
            Costing Tool
          </h1>
          <p className='text-muted-foreground mt-2 text-base sm:text-lg'>
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
            <OverviewSection calculations={calculations} />
            <ProfitAllocator profitAmount={calculations.profitAmount} />
            <ProjectQuote 
                calculations={calculations} 
                onPublish={handlePublish}
                isPublishing={isPublishing}
                isPublished={!!loadedQuoteId}
                isClientSelected={isClientSelected}
            />
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
