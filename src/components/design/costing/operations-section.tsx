'use client';

import { useFormContext, useFieldArray, useWatch, Control } from 'react-hook-form';
import { memo, useCallback, useMemo } from 'react';
import type { FormValues, Calculations } from '@/store/cost-store';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Cog,
  Trash2, 
  PlusCircle, 
  Users, 
  SlidersHorizontal, 
  AlertTriangle,
  Building,
  FileText,
  Receipt,
  Banknote
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

const OperationsTotalDisplay = ({ calculations }: { calculations: Calculations }) => {
  const total = calculations.totalOperationCost + calculations.salaryAmount + calculations.nssfAmount + calculations.shifAmount + calculations.miscAmount;
  return <span className="font-semibold">{formatCurrency(total)}</span>;
};

const OperationsSummaryCard = ({ calculations }: { calculations: Calculations }) => {
  return (
    <Card className="bg-muted/40 shadow-inner border-dashed">
      <CardHeader className="pb-4"><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
      <CardContent className="text-sm space-y-4">
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Building className="w-4 h-4 mr-2"/> Fixed Costs</span><span className="font-semibold">{formatCurrency(calculations.totalOperationCost)}</span></div>
        <Separator/>
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Users className="w-4 h-4 mr-2"/> Salaries</span><span className="font-semibold">{formatCurrency(calculations.salaryAmount)}</span></div>
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><FileText className="w-4 h-4 mr-2"/> NSSF</span><span className="font-semibold">{formatCurrency(calculations.nssfAmount)}</span></div>
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Receipt className="w-4 h-4 mr-2"/> SHIF</span><span className="font-semibold">{formatCurrency(calculations.shifAmount)}</span></div>
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><SlidersHorizontal className="w-4 h-4 mr-2"/> Misc. Costs</span><span className="font-semibold">{formatCurrency(calculations.miscAmount)}</span></div>
        <Separator/>
        <div className="flex justify-between items-center"><span className="text-muted-foreground font-bold">Total Cost</span><span className="font-bold text-lg text-primary">{formatCurrency(calculations.totalOperationCost + calculations.salaryAmount + calculations.nssfAmount + calculations.shifAmount + calculations.miscAmount)}</span></div>
      </CardContent>
    </Card>
  );
};

const FixedCostsCard = () => {
    const { control } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: 'operations' });

    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Fixed Operational Costs</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2">
                            <FormField control={control} name={`operations.${index}.name`} render={({ field }) => (<FormItem className="flex-grow"><FormLabel className="sr-only">Name</FormLabel><FormControl><Input placeholder="e.g., Rent" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={control} name={`operations.${index}.cost`} render={({ field }) => (<FormItem><FormLabel className="sr-only">Cost</FormLabel><FormControl><Input className="w-32" type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', cost: 0 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Fixed Cost</Button>
            </CardContent>
        </Card>
    )
}

const SalariesCard = ({ calculations }: { calculations: Calculations }) => {
    const { control } = useFormContext<FormValues>();
    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Salaries & Statutory Deductions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={control} name="salaryPercentage" render={({ field }) => (<FormItem><div className="flex justify-between items-center"><FormLabel>Salaries</FormLabel><span className="font-bold text-primary">{field.value?.toFixed(0) ?? 0}%</span></div><FormControl><Slider min={0} max={100} step={1} value={[field.value || 0]} onValueChange={(value) => field.onChange(value[0])} /></FormControl><FormDescription className="text-xs">Calculated as a percentage of Material & Labor cost.</FormDescription><div className="text-right text-sm text-muted-foreground">Amount: <span className="font-medium text-foreground">{formatCurrency(calculations.salaryAmount)}</span></div><FormMessage /></FormItem>)} />
                <Alert variant="destructive" className="bg-destructive/5 border-destructive/30"><AlertTriangle className="h-4 w-4 text-destructive" /><AlertTitle className="text-destructive">Important Note</AlertTitle><AlertDescription className="text-destructive/80 text-xs">The following costs are estimates based on the monthly gross salary per person and will be added to your total operational costs.</AlertDescription></Alert>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={control} name="numberOfPeople" render={({ field }) => (<FormItem><FormLabel>No. of People</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={control} name="grossSalary" render={({ field }) => (<FormItem><FormLabel>Gross Salary/Person</FormLabel><FormControl><Input type="number" placeholder="50000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="space-y-2">
                     <FormField control={control} name="enableNSSF" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>NSSF</FormLabel><FormDescription className="text-xs">National Social Security Fund.</FormDescription></div><div className="flex items-center gap-4"><span className="font-bold text-primary text-sm">{formatCurrency(calculations.nssfAmount)}</span><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></div></FormItem>)} />
                     <FormField control={control} name="enableSHIF" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>SHIF</FormLabel><FormDescription className="text-xs">Social Health Insurance Fund (2.75%).</FormDescription></div><div className="flex items-center gap-4"><span className="font-bold text-primary text-sm">{formatCurrency(calculations.shifAmount)}</span><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></div></FormItem>)} />
                </div>
            </CardContent>
        </Card>
    )
}

const MiscCostsCard = ({ calculations }: { calculations: Calculations }) => {
    const { control } = useFormContext<FormValues>();
    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Miscellaneous Costs</CardTitle></CardHeader>
            <CardContent>
                <FormField control={control} name="miscPercentage" render={({ field }) => (<FormItem><div className="flex justify-between items-center"><FormLabel>Contingency / Misc.</FormLabel><span className="font-bold text-primary">{field.value?.toFixed(0) ?? 0}%</span></div><FormControl><Slider min={0} max={100} step={1} value={[field.value || 0]} onValueChange={(value) => field.onChange(value[0])} /></FormControl><FormDescription className="text-xs">A buffer calculated as a percentage of the total base cost.</FormDescription><div className="text-right text-sm text-muted-foreground">Amount: <span className="font-medium text-foreground">{formatCurrency(calculations.miscAmount)}</span></div><FormMessage /></FormItem>)} />
            </CardContent>
        </Card>
    )
}

const OperationsList = ({ calculations }: { calculations: Calculations }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar rounded-md bg-muted/20 p-3">
            <FixedCostsCard />
            <SalariesCard calculations={calculations} />
            <MiscCostsCard calculations={calculations} />
        </div>
      </div>
      <div className="lg:col-span-1">
         <h3 className="font-semibold text-lg mb-4">Cost Overview</h3>
        <OperationsSummaryCard calculations={calculations} />
      </div>
    </div>
  );
};

export function OperationsSection({ calculations }: { calculations: Calculations }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start items-center p-4 h-auto rounded-xl bg-card shadow-sm">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg"><Cog className="h-6 w-6 text-primary" /></div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-lg">Operations</span>
              <span className="text-sm text-muted-foreground">Total Cost: <OperationsTotalDisplay calculations={calculations} /></span>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-screen max-w-4xl p-6 shadow-2xl rounded-xl" side="bottom" align="start">
        <OperationsList calculations={calculations} />
      </PopoverContent>
    </Popover>
  );
}
