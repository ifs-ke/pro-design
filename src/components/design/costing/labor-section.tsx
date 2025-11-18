'use client';

import { useFormContext, useFieldArray, useWatch, Control } from 'react-hook-form';
import { memo, useCallback, useMemo } from 'react';
import type { FormValues, Calculations, Labor } from '@/store/cost-store';
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
import { Slider } from "@/components/ui/slider";
import { Button } from '@/components/ui/button';
import {
  HardHat,
  Trash2, 
  PlusCircle, 
  ListTree, 
  Sigma,
  Clock, 
  Calendar, 
  Users, 
  Zap
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface LaborItemProps {
  control: Control<FormValues>;
  index: number;
  remove: (index: number) => void;
}

const LaborItem = memo(({ control, index, remove }: LaborItemProps) => {
  const { watch, setValue } = useFormContext<FormValues>();
  const laborItem = watch(`labor.${index}`) as Labor;
  const rateType = watch(`labor.${index}.rateType`);

  const totalItemCost = useMemo(() => {
    const rate = Number(laborItem.rate) || 0;
    if (rateType === 'hourly') {
      return rate * (Number(laborItem.hours) || 0);
    } else if (rateType === 'daily') {
      return rate * (Number(laborItem.days) || 0);
    }
    return 0;
  }, [laborItem, rateType]);

  const handleRemove = useCallback(() => remove(index), [index, remove]);

  return (
    <div className="p-4 border rounded-lg bg-background space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <FormField control={control} name={`labor.${index}.vendor`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Vendor / Service</FormLabel><FormControl><Input {...field} placeholder="e.g., Electrician" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={control} name={`labor.${index}.rateType`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Rate Type</FormLabel><FormControl><RadioGroup onValueChange={(value) => {
                  field.onChange(value);
                  if (value === 'hourly') setValue(`labor.${index}.days`, 0);
                  if (value === 'daily') setValue(`labor.${index}.hours`, 0);
                }} defaultValue={field.value} className="flex items-center pt-2 gap-4"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="hourly" /></FormControl><FormLabel className="font-normal text-sm">Hourly</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="daily" /></FormControl><FormLabel className="font-normal text-sm">Daily</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={handleRemove} className="text-muted-foreground hover:text-destructive ml-2 shrink-0"><Trash2 className="h-4 w-4" /></Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
             <FormField
                control={control}
                name={`labor.${index}.rate`}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">{`Rate (Ksh/${rateType === 'hourly' ? 'hr' : 'day'})`}</FormLabel>
                    <FormControl><Input type="number" placeholder="60" {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
           <FormField
                control={control}
                name={`labor.${index}.hours`}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">Hours</FormLabel>
                    <FormControl><Input type="number" placeholder="8" {...field} disabled={rateType !== 'hourly'} onChange={e => field.onChange(e.target.valueAsNumber || 0)} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`labor.${index}.days`}
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">Days</FormLabel>
                    <FormControl><Input type="number" placeholder="1" {...field} disabled={rateType !== 'daily'} onChange={e => field.onChange(e.target.valueAsNumber || 0)}/></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
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
  const laborConcurrencyPercentage = useWatch({ control, name: 'laborConcurrencyPercentage' });

  return (
    <Card className="bg-muted/40 shadow-inner border-dashed">
      <CardHeader className="pb-4"><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
      <CardContent className="text-sm space-y-4">
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Users className="w-4 h-4 mr-2"/> Total Labor Hours</span><span className="font-semibold">{formatNumber(calculations.totalLaborHours)} hrs</span></div>
        <Separator/>
         <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Zap className="w-4 h-4 mr-2"/> Effective Labor Hours</span><span className="font-semibold">{formatNumber(calculations.effectiveLaborHours)} hrs</span></div>
        <p className="text-xs text-muted-foreground -mt-2">Adjusted for a <span className="font-bold">{laborConcurrencyPercentage}%</span> concurrency, representing labor overlap.</p>
        <Separator/>
        <div className="flex justify-between items-center"><span className="text-muted-foreground font-bold">Total Labor Cost</span><span className="font-bold text-lg text-primary">{formatCurrency(calculations.totalLaborCost)}</span></div>
      </CardContent>
    </Card>
  );
};

const LaborList = ({ calculations }: { calculations: Calculations }) => {
  const { control } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'labor' });

  const handleAddLabor = () => append({ vendor: "", rateType: 'hourly', rate: 0, hours: 8, days: 1 });
  const handleRemove = useCallback((index: number) => remove(index), [remove]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Labor & Service Items</h3>
             <Button type="button" variant="default" size="sm" onClick={handleAddLabor}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
        </div>
        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-3 custom-scrollbar rounded-md border bg-muted/20 p-3">
          {fields.length > 0 ? (
            fields.map((field, index) => (
              <LaborItem key={field.id} control={control} index={index} remove={handleRemove} />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground"><p>No labor items added yet.</p></div>
          )}
        </div>
       
      </div>
      <div className="lg:col-span-1">
         <h3 className="font-semibold text-lg mb-4">Cost Overview</h3>
        <LaborSummaryCard calculations={calculations} />
        <Card className="mt-4 bg-muted/40 shadow-inner border-dashed">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Concurrency Adjustment</CardTitle>
                <p className="text-sm text-muted-foreground">Model parallel work. Higher % means more overlap & fewer effective hours.</p>
            </CardHeader>
            <CardContent>
                 <FormField
                    control={control}
                    name="laborConcurrencyPercentage"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <div className="flex items-center gap-4">
                                <Slider
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={[field.value || 0]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                />
                                <span className="font-bold text-primary text-lg w-16 text-right">{field.value || 0}%</span>
                            </div>
                        </FormControl>
                        </FormItem>
                    )}
                    />
            </CardContent>
        </Card>
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
                Add, edit, and manage all labor and vendor-related costs for your project. Adjust for concurrency to better estimate timelines.
            </DialogDescription>
        </DialogHeader>
        <LaborList calculations={calculations} />
      </DialogContent>
    </Dialog>
  );
}
