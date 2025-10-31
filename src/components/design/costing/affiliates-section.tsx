'use client';

import { useFormContext, useFieldArray, useWatch, Control } from 'react-hook-form';
import { memo, useCallback, useMemo } from 'react';
import type { FormValues } from '@/store/cost-store';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover';
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
}

const AffiliateItem = memo(({ control, index, remove }: AffiliateItemProps) => {
  const { watch } = useFormContext<FormValues>();
  const rateType = watch(`affiliates.${index}.rateType`);
  const watchedUnits = watch(`affiliates.${index}.units`);
  const watchedRate = watch(`affiliates.${index}.rate`);

  const totalItemCost = useMemo(() => {
    if (rateType === 'percentage') {
      // Note: Base cost for percentage calculation is handled in the main store/reducer.
      // Here, we just show the rate.
      return watchedRate || 0;
    } else {
      return (parseFloat(String(watchedUnits)) || 0) * (parseFloat(String(watchedRate)) || 0);
    }
  }, [rateType, watchedUnits, watchedRate]);

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
          <FormField control={control} name={`affiliates.${index}.units`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Units/Items</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
        )}
        <FormField control={control} name={`affiliates.${index}.rate`} render={({ field }) => (<FormItem className={rateType === 'percentage' ? 'md:col-span-2' : ''}><FormLabel className="text-xs">{rateType === 'percentage' ? 'Percentage Rate (%)' : 'Rate per Unit (Ksh)'}</FormLabel><FormControl><Input type="number" placeholder={rateType === 'percentage' ? '15' : '1000'} {...field} /></FormControl><FormMessage /></FormItem>)} />
      </div>
      
      <div className="text-sm font-medium text-right pr-1 pt-2 border-t border-dashed">
        {rateType === 'percentage' ? (
          <>Commission: <span className="font-semibold text-primary">{totalItemCost}%</span></>
        ) : (
          <>Item Total: <span className="font-semibold text-primary">{formatCurrency(totalItemCost)}</span></>
        )}
      </div>
    </div>
  );
});
AffiliateItem.displayName = 'AffiliateItem';


const AffiliateTotalDisplay = () => {
    const { control, watch } = useFormContext<FormValues>();
    const affiliates = watch('affiliates');
    const baseTotal = 0; // This should be calculated based on materials and labor

    const totalAffiliateCost = useMemo(() => {
        return affiliates?.reduce((acc, item) => {
            if (item.rateType === 'percentage') {
                const percentageCost = baseTotal * (item.rate / 100);
                return acc + percentageCost;
            } else {
                return acc + (item.units || 0) * (item.rate || 0);
            }
        }, 0) || 0;
    }, [affiliates, baseTotal]);

    return <span className="font-semibold">{formatCurrency(totalAffiliateCost)}</span>;
};

const AffiliateSummaryCard = () => {
  const { control } = useFormContext<FormValues>();
  const affiliates = useWatch({ control, name: 'affiliates' });

  const summary = useMemo(() => {
    const totalPartners = affiliates?.length || 0;
    const percentagePartners = affiliates?.filter(p => p.rateType === 'percentage').length || 0;
    const fixedPartners = totalPartners - percentagePartners;
    const totalFixedCost = affiliates?.reduce((acc, item) => item.rateType === 'fixed' ? acc + ((item.units || 0) * (item.rate || 0)) : acc, 0) || 0;

    return { totalPartners, percentagePartners, fixedPartners, totalFixedCost };
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
        <div className="flex justify-between items-center"><span className="text-muted-foreground font-bold">Total Fixed Cost</span><span className="font-bold text-lg text-primary">{formatCurrency(summary.totalFixedCost)}</span></div>
      </CardContent>
    </Card>
  );
};

const AffiliatesList = () => {
  const { control } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'affiliates' });

  const handleAddAffiliate = () => append({ name: "", rateType: 'percentage', rate: 10, units: 1 });
  const handleRemove = useCallback((index: number) => remove(index), [remove]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-semibold text-lg">Affiliate & Partner Items</h3>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar rounded-md border bg-muted/20 p-3">
          {fields.length > 0 ? (
            fields.map((field, index) => (
              <AffiliateItem key={field.id} control={control} index={index} remove={handleRemove} />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground"><p>No affiliates or partners added yet.</p></div>
          )}
        </div>
        <Button type="button" variant="default" size="sm" onClick={handleAddAffiliate}><PlusCircle className="mr-2 h-4 w-4" /> Add Partner</Button>
      </div>
      <div className="lg:col-span-1">
         <h3 className="font-semibold text-lg mb-4">Cost Overview</h3>
        <AffiliateSummaryCard />
      </div>
    </div>
  );
};

export function AffiliatesSection() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start items-center p-4 h-auto rounded-xl bg-card shadow-sm">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg"><Handshake className="h-6 w-6 text-primary" /></div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-lg">Affiliates & Partners</span>
              <span className="text-sm text-muted-foreground">Total Cost: <AffiliateTotalDisplay /></span>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-screen max-w-4xl p-6 shadow-2xl rounded-xl" side="bottom" align="start">
        <AffiliatesList />
      </PopoverContent>
    </Popover>
  );
}
