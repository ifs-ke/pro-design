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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Package, Trash2, PlusCircle, MessageSquarePlus, MessageSquareX, ListTree, Sigma,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MaterialItemProps {
  control: Control<FormValues>;
  index: number;
  remove: (index: number) => void;
}

const MaterialItem = memo(({ control, index, remove }: MaterialItemProps) => {
  const { setValue } = useFormContext<FormValues>();
  const material = useWatch({ control, name: `materials.${index}` });
  const { cost, quantity, description } = material || {};
  const totalItemCost = (parseFloat(String(cost)) || 0) * (parseInt(String(quantity), 10) || 0);

  const handleRemove = useCallback(() => remove(index), [index, remove]);
  const handleToggleDescription = useCallback((show: boolean) => {
    setValue(`materials.${index}.description`, show ? '' : undefined, { shouldDirty: true });
  }, [index, setValue]);

  return (
    <div className="p-4 border rounded-lg bg-background space-y-3 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex justify-between items-start">
            <div className="flex-grow grid grid-cols-2 md:grid-cols-[2fr_1fr_1.5fr] gap-4 items-start">
                <FormField control={control} name={`materials.${index}.name`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Material</FormLabel><FormControl><Input {...field} placeholder="e.g., Oak Wood" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={control} name={`materials.${index}.quantity`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Qty</FormLabel><FormControl><Input {...field} type="number" placeholder="1" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={control} name={`materials.${index}.cost`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Unit Cost (Ksh)</FormLabel><FormControl><Input {...field} type="number" placeholder="1500" /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={handleRemove} className="text-muted-foreground hover:text-destructive ml-2 mt-6 shrink-0"><Trash2 className="h-4 w-4" /></Button>
        </div>
        <div className="text-sm font-medium text-right pr-1 pt-2 border-t border-dashed">Item Total: <span className="font-semibold text-primary">{formatCurrency(totalItemCost)}</span></div>
        {description !== undefined ? (
            <div className="space-y-2 pt-2 border-t border-dashed">
                <FormField control={control} name={`materials.${index}.description`} render={({ field }) => (<FormItem><FormLabel className="text-xs">Description</FormLabel><FormControl><Textarea placeholder="Add a short description..." {...field} className="h-16 text-sm" /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="link" size="sm" className="p-0 h-auto text-muted-foreground text-xs" onClick={() => handleToggleDescription(false)}><MessageSquareX className="mr-1 text-destructive w-3 h-3" /> Hide Description</Button>
            </div>
        ) : (
            <Button type="button" variant="link" size="sm" className="p-0 h-auto text-muted-foreground text-xs" onClick={() => handleToggleDescription(true)}><MessageSquarePlus className="mr-1 w-3 h-3" /> Add Description</Button>
        )}
    </div>
  );
});
MaterialItem.displayName = 'MaterialItem';

const MaterialTotalDisplay = ({ calculations }: { calculations: Calculations }) => {
    return <span className="font-semibold">{formatCurrency(calculations.totalMaterialCost)}</span>;
};

const MaterialSummaryCard = ({ calculations }: { calculations: Calculations }) => {
  const { control } = useFormContext<FormValues>();
  const materials = useWatch({ control, name: 'materials' });

  const summary = useMemo(() => {
    const totalItems = materials?.length || 0;
    const totalQuantity = materials?.reduce((acc, item) => acc + (parseInt(String(item.quantity), 10) || 0), 0) || 0;
    return { totalItems, totalQuantity };
  }, [materials]);

  return (
    <Card className="bg-muted/40 shadow-inner border-dashed">
      <CardHeader className="pb-4"><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
      <CardContent className="text-sm space-y-4">
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><ListTree className="w-4 h-4 mr-2"/> Total Unique Items</span><span className="font-semibold">{summary.totalItems}</span></div>
        <Separator/>
        <div className="flex justify-between items-center"><span className="text-muted-foreground flex items-center"><Sigma className="w-4 h-4 mr-2"/> Total Quantity</span><span className="font-semibold">{summary.totalQuantity}</span></div>
        <Separator/>
        <div className="flex justify-between items-center"><span className="text-muted-foreground font-bold">Total Cost</span><span className="font-bold text-lg text-primary">{formatCurrency(calculations.totalMaterialCost)}</span></div>
      </CardContent>
    </Card>
  );
};

const MaterialsList = ({ calculations }: { calculations: Calculations }) => {
  const { control } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'materials' });
  const handleAddMaterial = () => append({ name: '', quantity: 1, cost: 0, description: undefined });
  const handleRemove = useCallback((index: number) => remove(index), [remove]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-semibold text-lg">Material Items</h3>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar rounded-md border bg-muted/20 p-3">
          {fields.length > 0 ? (
            fields.map((field, index) => (
              <MaterialItem key={field.id} control={control} index={index} remove={handleRemove} />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground"><p>No materials added yet.</p></div>
          )}
        </div>
        <Button type="button" variant="default" size="sm" onClick={handleAddMaterial}><PlusCircle className="mr-2 h-4 w-4" /> Add Material</Button>
      </div>
      <div className="lg:col-span-1">
         <h3 className="font-semibold text-lg mb-4">Cost Overview</h3>
        <MaterialSummaryCard calculations={calculations} />
      </div>
    </div>
  );
};

export function MaterialsSection({ calculations }: { calculations: Calculations }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start items-center p-4 h-auto rounded-xl bg-card shadow-sm">
           <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg"><Package className="h-6 w-6 text-primary" /></div>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-lg">Materials</span>
              <span className="text-sm text-muted-foreground">Total Cost: <MaterialTotalDisplay calculations={calculations} /></span>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
            <DialogTitle>Materials Cost Calculator</DialogTitle>
            <DialogDescription>
                Add, edit, and manage all material-related costs for your project.
            </DialogDescription>
        </DialogHeader>
        <MaterialsList calculations={calculations} />
      </DialogContent>
    </Dialog>
  );
}