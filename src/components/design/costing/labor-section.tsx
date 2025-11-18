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
import { Separator } from "@/components/ui/separator";
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from '@/components/ui/button';
import {
  HardHat,
  Trash2, 
  PlusCircle, 
  ListTree, 
  Sigma,
  Clock, 
  Calendar
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LaborItemProps {
  control: Control<FormValues>;
  index: number;
  remove: (index: number) => void;
}

const LaborItem = memo(({ control, index, remove }: LaborItemProps) => {
  const { watch } = useFormContext<FormValues>();
  const labor = watch(`labor.${index}`);
  const { rateType, units, rate, hours, days } = labor || {};
  const totalItemCost = (rate || 0) * (rateType === 'hourly' ? (hours || 0) : (days || 0));

  const handleRemove = useCallback(() => remove(index), [index, remove]);

  return (
    <div className="p-4 border rounded-lg bg-background space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <FormField control={control} name={`labor.${index}.vendor`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Vendor / Service</FormLabel><FormControl><Input {...field} placeholder="e.g., Electrician" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={control} name={`labor.${index}.rateType`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Rate Type</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center pt-2 gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="hourly" id={`hourly-${field.id}`} /></FormControl><FormLabel htmlFor={`hourly-${field.id}`} className="font-normal text-sm">Hourly</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="daily" id={`daily-${field.id}`} /></FormControl><FormLabel htmlFor={`daily-${field.id}`} className="font-normal text-sm">Daily</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={handleRemove} className="text-muted-foreground hover:text-destructive ml-2 shrink-0"><Trash2 className="h-4 w-4" /></Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <FormField control={control} name={`labor.${index}.hours`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Hours</FormLabel><FormControl><Input type="number" placeholder="8" {...field} disabled={rateType !== 'hourly'} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={control} name={`labor.${index}.days`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Days</FormLabel><FormControl><Input type="number" placeholder="1" {...field} disabled={rateType !== 'daily'} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={control} name={`labor.${index}.rate`} render={({ field }) => (<FormItem><FormLabel className="text-xs">{`Rate (Ksh/${rateType === 'hourly' ? 'hr' : 'day'})`}</FormLabel><FormControl><Input type="number" placeholder="60" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      
      <div className="text-sm font-medium text-right pr-1 pt-2 border-t border-dashed">Item Total: <span className="font-semibold text-primary">{formatCurrency(totalItemCost)}</span></div>
    </div>
  );
});
LaborItem.displayName = 'LaborItem';

const LaborTotalDisplay = ({ calculations }: { calculations: Calculations }) => {
    return <span className="font-semibold">{formatCurrency(calculations.totalLaborCost)}</span>;
};

const LaborSummaryCard = ({ calculations }: { calculations: Calculations }) => {
  const { control } = useFormContext<FormValues>();
  const labor = useWatch({ control, name: 'labor' });

  const summary = useMemo(() => {
    const totalVendors = labor?.length || 0;
    const totalHours = labor?.reduce((acc, item) => item.rateType === 'hourly' ? acc + (item.hours || 0) : acc, 0) || 0;
    const totalDays = labor?.reduce((acc, item) => item.rateType === 'daily' ? acc + (item.days || 0) : acc, 0) || 0;
    return { totalVendors, totalHours, totalDays };
  }, [labor]);

  return (
    <Card className="bg-muted/40 shadow-inner border-dashed">
      <CardHeader className="pb-4"><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
      <CardContent className="text-sm space-y-4">
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><ListTree className="w-4 h-4 mr-2"/> Total Vendors</span><span className="font-semibold">{summary.totalVendors}</span></div>
        <Separator/>
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Clock className="w-4 h-4 mr-2"/> Total Hours</span><span className="font-semibold">{summary.totalHours}</span></div>
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Calendar className="w-4 h-4 mr-2"/> Total Days</span><span className="font-semibold">{summary.totalDays}</span></div>
        <Separator/>
        <div className="flex justify-between items-center"><span className="text-muted-foreground font-bold">Total Cost</span><span className="font-bold text-lg text-primary">{formatCurrency(calculations.totalLaborCost)}</span></div>
      </CardContent>
    </Card>
  );
};

const LaborList = ({ calculations }: { calculations: Calculations }) => {
  const { control } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'labor' });

  const handleAddLabor = () => append({ vendor: "", rateType: 'hourly', hours: 1, days: 1, rate: 0 });
  const handleRemove = useCallback((index: number) => remove(index), [remove]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-semibold text-lg">Labor & Service Items</h3>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar rounded-md border bg-muted/20 p-3">
          {fields.length > 0 ? (
            fields.map((field, index) => (
              <LaborItem key={field.id} control={control} index={index} remove={handleRemove} />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground"><p>No labor items added yet.</p></div>
          )}
        </div>
        <Button type="button" variant="default" size="sm" onClick={handleAddLabor}><PlusCircle className="mr-2 h-4 w-4" /> Add Labor / Service</Button>
      </div>
      <div className="lg:col-span-1">
         <h3 className="font-semibold text-lg mb-4">Cost Overview</h3>
        <LaborSummaryCard calculations={calculations} />
      </div>
    </div>
  );
};

interface LaborSectionProps {
  calculations: Calculations;
}

export function LaborSection({ calculations }: LaborSectionProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start items-center p-4 h-auto rounded-xl bg-card shadow-sm">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg"><HardHat className="h-6 w-6 text-primary" /></div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-lg">Labor & Vendors</span>
              <span className="text-sm text-muted-foreground">Total Cost: <LaborTotalDisplay calculations={calculations} /></span>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
            <DialogTitle>Labor & Vendors Cost Calculator</DialogTitle>
            <DialogDescription>
                Add, edit, and manage all labor and vendor-related costs for your project.
            </DialogDescription>
        </DialogHeader>
        <LaborList calculations={calculations} />
      </DialogContent>
    </Dialog>
  );
}