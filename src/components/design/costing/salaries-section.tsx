'use client';

import { useFormContext, useFieldArray, useWatch, Control } from 'react-hook-form';
import { memo, useMemo } from 'react';
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
  FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Users,
  Trash2, 
  PlusCircle, 
  UserPlus,
  FileText,
  Receipt,
  Banknote
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const SalaryItem = memo(({ control, index, remove }: { control: Control<FormValues>, index: number, remove: (index: number) => void }) => {
    return (
        <div className="flex items-end gap-2 p-3 bg-muted/20 rounded-md border">
            <FormField control={control} name={`salaries.${index}.role`} render={({ field }) => (<FormItem className="flex-grow"><FormLabel className="text-xs">Role</FormLabel><FormControl><Input placeholder="e.g., Project Manager" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={control} name={`salaries.${index}.salary`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Gross Salary</FormLabel><FormControl><Input className="w-32" type="number" placeholder="50000" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>
        </div>
    );
});
SalaryItem.displayName = 'SalaryItem';

const SalariesList = () => {
    const { control } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: 'salaries' });

    return (
        <div className="space-y-3">
             <h4 className="font-medium text-sm text-center py-1 bg-background rounded-md border">Direct Salary Costs</h4>
            <div className="space-y-3">
                {fields.map((field, index) => (
                    <SalaryItem key={field.id} control={control} index={index} remove={remove} />
                ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ role: '', salary: 0 })}><UserPlus className="mr-2 h-4 w-4" /> Add Person</Button>
        </div>
    );
}

const SalariesCard = ({ calculations }: { calculations: Calculations }) => {
    const { control } = useFormContext<FormValues>();
    const salaries = useWatch({ control, name: 'salaries' });
    const totalGrossSalary = useMemo(() => salaries?.reduce((acc, s) => acc + (Number(s.salary) || 0), 0) || 0, [salaries]);
    const directCostBase = calculations.totalMaterialCost + calculations.totalLaborCost + calculations.totalOperationCost;
    const salaryPercentageAmount = (useWatch({ control, name: 'salaryPercentage' }) / 100) * directCostBase;

    return (
        <Card>
            <CardHeader><CardTitle className="text-base">Salaries & Statutory Deductions</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <FormField control={control} name="salaryPercentage" render={({ field }) => (<FormItem><div className="flex justify-between items-center"><FormLabel>Salary Allocation (as % of Costs)</FormLabel><span className="font-bold text-primary">{field.value?.toFixed(0) ?? 0}%</span></div><FormControl><Slider min={0} max={100} step={1} value={[field.value || 0]} onValueChange={(value) => field.onChange(value[0])} /></FormControl><FormDescription className="text-xs">A percentage of Material, Labor & Fixed Operational costs allocated for salaries.</FormDescription><div className="text-right text-sm text-muted-foreground">Amount: <span className="font-medium text-foreground">{formatCurrency(salaryPercentageAmount)}</span></div><FormMessage /></FormItem>)} />
                
                <SalariesList />
                
                <div>
                    <h4 className="font-medium text-sm text-center py-1 bg-background rounded-md border mb-3">Statutory Deductions (based on Total Gross Salary of <span className="font-bold">{formatCurrency(totalGrossSalary)}</span>)</h4>
                    <div className="space-y-2">
                        <FormField control={control} name="enableNSSF" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>NSSF</FormLabel><FormDescription className="text-xs">National Social Security Fund (6% of Gross).</FormDescription></div><div className="flex items-center gap-4	"><span className="font-bold text-primary text-sm">{formatCurrency(calculations.nssfAmount)}</span><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></div></FormItem>)} />
                        <FormField control={control} name="enableSHIF" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3"><div className="space-y-0.5"><FormLabel>SHIF</FormLabel><FormDescription className="text-xs">Social Health Insurance Fund (2.75% of Gross).</FormDescription></div><div className="flex items-center gap-4"><span className="font-bold text-primary text-sm">{formatCurrency(calculations.shifAmount)}</span><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></div></FormItem>)} />
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}

const SalaryTotalDisplay = ({ calculations }: { calculations: Calculations }) => {
    const total = calculations.salaryAmount + calculations.nssfAmount + calculations.shifAmount;
    return <span className="font-semibold">{formatCurrency(total)}</span>;
};

export function SalariesSection({ calculations }: { calculations: Calculations }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start items-center p-4 h-auto rounded-xl bg-card shadow-sm">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg"><Users className="h-6 w-6 text-primary" /></div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-lg">Salaries</span>
              <span className="text-sm text-muted-foreground">Total Cost: <SalaryTotalDisplay calculations={calculations} /></span>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
            <DialogTitle>Salaries & Deductions</DialogTitle>
            <DialogDescription>
                Manage salaries, statutory deductions (NSSF, SHIF), and other salary-related costs.
            </DialogDescription>
        </DialogHeader>
        <SalariesCard calculations={calculations} />
      </DialogContent>
    </Dialog>
  );
}
