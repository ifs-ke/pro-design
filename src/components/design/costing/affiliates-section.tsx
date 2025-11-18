'use client';

import { useFormContext, useFieldArray, useWatch, Control } from 'react-hook-form';
import { memo, useCallback, useMemo } from 'react';
import type { FormValues, Calculations } from '@/store/cost-store';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Handshake,
  Trash2, 
  PlusCircle, 
  ListTree, 
  Percent,
  Sigma
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AffiliateItemProps {
  control: Control<FormValues>;
  index: number;
  remove: (index: number) => void;
  calculations: Calculations;
}

const AffiliateItem = memo(({ control, index, remove, calculations }: AffiliateItemProps) => {
  const { watch } = useFormContext<FormValues>();
  const affiliate = watch(`affiliates.${index}`);
  
  // Return null if the affiliate data is not available, e.g., during a delete animation
  if (!affiliate) return null;

  const { rateType, units, rate } = affiliate;

  const itemAmount = useMemo(() => {
    const numericRate = Number(rate) || 0;
    if (rateType === 'percentage') {
      // Affiliate commission is a percentage of the *total revenue* (totalPrice).
      // The `calculations` object is the result of the store's `calculate` function, which correctly computes the final totalPrice.
      return (numericRate / 100) * (calculations.totalPrice || 0);
    } else { // Fixed rate
      const numericUnits = Number(units) || 0;
      return numericUnits * numericRate;
    }
  }, [rateType, units, rate, calculations.totalPrice]);

  const handleRemove = useCallback(() => remove(index), [index, remove]);

  return (
    <div className="p-4 border rounded-lg bg-background space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <FormField control={control} name={`affiliates.${index}.name`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Partner Name</FormLabel><FormControl><Input placeholder="e.g., Design Co." {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={control} name={`affiliates.${index}.rateType`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Rate Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a rate type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={handleRemove} className="text-muted-foreground hover:text-destructive ml-2 shrink-0"><Trash2 className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        {rateType === 'fixed' && (
          <FormField control={control} name={`affiliates.${index}.units`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Units/Items</FormLabel><FormControl><Input type="number" placeholder="1" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
        )}
        <FormField control={control} name={`affiliates.${index}.rate`} render={({ field }) => (<FormItem className={rateType === 'percentage' ? 'md:col-span-2' : ''}><FormLabel className="text-xs">{rateType === 'percentage' ? 'Percentage Rate (%)' : 'Rate per Unit (Ksh)'}</FormLabel><FormControl><Input type="number" placeholder={rateType === 'percentage' ? '15' : '1000'} {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
      </div>
      
      <div className="text-sm font-medium text-right pr-1 pt-2 border-t border-dashed">
        Amount: <span className="font-semibold text-primary">{formatCurrency(itemAmount)}</span>
      </div>
    </div>
  );
});
AffiliateItem.displayName = 'AffiliateItem';

const AffiliateTotalDisplay = ({ calculations }: { calculations: Calculations }) => {
    return <span className="font-semibold">{formatCurrency(calculations.totalAffiliateCost)}</span>;
};

const AffiliateSummaryCard = ({ calculations }: { calculations: Calculations }) => {
  const { control } = useFormContext<FormValues>();
  const affiliates = useWatch({ control, name: 'affiliates' });

  const summary = useMemo(() => {
    const totalPartners = affiliates?.length || 0;
    const percentagePartners = affiliates?.filter(p => p.rateType === 'percentage').length || 0;
    const fixedPartners = totalPartners - percentagePartners;
    
    return { totalPartners, percentagePartners, fixedPartners };
  }, [affiliates]);

  return (
    <Card className="bg-muted/40 shadow-inner border-dashed">
      <CardHeader className="pb-4"><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
      <CardContent className="text-sm space-y-4">
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><ListTree className="w-4 h-4 mr-2"/> Total Partners</span><span className="font-semibold">{summary.totalPartners}</span></div>
        <Separator/>
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Percent className="w-4 h-4 mr-2"/> Commission-Based</span><span className="font-semibold">{summary.percentagePartners}</span></div>
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Sigma className="w-4 h-4 mr-2"/> Fixed-Rate</span><span className="font-semibold">{summary.fixedPartners}</span></div>
        <Separator/>
        <div className="flex justify-between items-center"><span className="text-muted-foreground font-bold">Total Affiliate Cost</span><span className="font-bold text-lg text-primary">{formatCurrency(calculations.totalAffiliateCost)}</span></div>
      </CardContent>
    </Card>
  );
};

const AffiliatesList = ({ calculations }: { calculations: Calculations }) => {
  const { control } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'affiliates' });

  const handleAddAffiliate = () => append({ name: "", rateType: 'percentage', rate: 10, units: 1 });
  const handleRemove = useCallback((index: number) => remove(index), [remove]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Affiliate & Partner Items</h3>
            <Button type="button" variant="default" size="sm" onClick={handleAddAffiliate}><PlusCircle className="mr-2 h-4 w-4" /> Add Partner</Button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar rounded-md border bg-muted/20 p-3">
          {fields.length > 0 ? (
            fields.map((field, index) => (
              <AffiliateItem key={field.id} control={control} index={index} remove={handleRemove} calculations={calculations} />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground"><p>No affiliates or partners added yet.</p></div>
          )}
        </div>
      </div>
      <div className="lg:col-span-1">
         <h3 className="font-semibold text-lg mb-4">Cost Overview</h3>
        <AffiliateSummaryCard calculations={calculations} />
      </div>
    </div>
  );
};

export function AffiliatesSection({ calculations }: { calculations: Calculations }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start items-center p-4 h-auto rounded-xl bg-card shadow-sm">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg"><Handshake className="h-6 w-6 text-primary" /></div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-lg">Affiliates & Partners</span>
              <span className="text-sm text-muted-foreground">Total Cost: <AffiliateTotalDisplay calculations={calculations} /></span>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
            <DialogTitle>Affiliates & Partners Cost Calculator</DialogTitle>
            <DialogDescription>
                Manage referral commissions, partner fees, and other affiliate-related costs.
            </DialogDescription>
        </DialogHeader>
        <AffiliatesList calculations={calculations} />
      </DialogContent>
    </Dialog>
  );
}
