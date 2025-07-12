"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Package,
  HardHat,
  Cog,
  ReceiptText,
  TrendingUp,
  AlertTriangle,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";

const materialItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  cost: z.coerce.number().min(0, "Cost cannot be negative."),
});

const laborItemSchema = z.object({
  vendor: z.string().min(1, "Vendor is required."),
  hours: z.coerce.number().min(0, "Hours cannot be negative."),
  rate: z.coerce.number().min(0, "Rate cannot be negative."),
});

const operationItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  cost: z.coerce.number().min(0, "Cost cannot be negative."),
});

export const formSchema = z.object({
  materials: z.array(materialItemSchema).optional(),
  labor: z.array(laborItemSchema).optional(),
  operations: z.array(operationItemSchema).optional(),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative.").max(100),
  profitMargin: z.coerce.number().min(0, "Profit margin cannot be negative."),
});

interface CostFormProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function CostForm({ form }: CostFormProps) {
  const {
    fields: materialFields,
    append: appendMaterial,
    remove: removeMaterial,
  } = useFieldArray({ control: form.control, name: "materials" });
  const {
    fields: laborFields,
    append: appendLabor,
    remove: removeLabor,
  } = useFieldArray({ control: form.control, name: "labor" });
  const {
    fields: operationFields,
    append: appendOperation,
    remove: removeOperation,
  } = useFieldArray({ control: form.control, name: "operations" });

  const watchedValues = form.watch();
  const profitMargin = watchedValues.profitMargin;

  const totalMaterialCost =
    watchedValues.materials?.reduce((acc, item) => acc + (item.cost || 0), 0) ??
    0;
  const totalLaborCost =
    watchedValues.labor?.reduce(
      (acc, item) => acc + (item.hours || 0) * (item.rate || 0),
      0
    ) ?? 0;
  const totalOperationCost =
    watchedValues.operations?.reduce(
      (acc, item) => acc + (item.cost || 0),
      0
    ) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Costing</CardTitle>
        <CardDescription>
          Enter the core costs of your project to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <Accordion type="multiple" defaultValue={["materials", "labor", "operations"]} className="w-full">
              {/* Materials Section */}
              <AccordionItem value="materials">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Package className="size-5 text-primary" />
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Materials</span>
                        <span className="text-sm text-muted-foreground font-normal">Total: {formatCurrency(totalMaterialCost)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {materialFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_auto_auto] gap-2 items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`materials.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? 'sr-only' : ''}>Material Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Fabric" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`materials.${index}.cost`}
                        render={({ field }) => (
                          <FormItem>
                             <FormLabel className={index !== 0 ? 'sr-only' : ''}>Cost ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="500"
                                {...field}
                                className="w-28"
                              />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMaterial(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendMaterial({ name: "", cost: 0 })}
                  >
                    <PlusCircle className="mr-2" /> Add Material
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Labor Section */}
              <AccordionItem value="labor">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <HardHat className="size-5 text-primary" />
                     <div className="flex flex-col items-start">
                        <span className="font-semibold">Labor / Vendors</span>
                        <span className="text-sm text-muted-foreground font-normal">Total: {formatCurrency(totalLaborCost)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {laborFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`labor.${index}.vendor`}
                        render={({ field }) => (
                           <FormItem>
                            <FormLabel className={index !== 0 ? 'sr-only' : ''}>Vendor</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Electrician" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`labor.${index}.hours`}
                        render={({ field }) => (
                           <FormItem>
                            <FormLabel className={index !== 0 ? 'sr-only' : ''}>Hours</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="8" {...field} className="w-24" />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`labor.${index}.rate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={index !== 0 ? 'sr-only' : ''}>Rate ($/hr)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="60" {...field} className="w-24" />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLabor(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLabor({ vendor: "", hours: 0, rate: 0 })}
                  >
                    <PlusCircle className="mr-2" /> Add Labor
                  </Button>
                </AccordionContent>
              </AccordionItem>
              
              {/* Operations Section */}
              <AccordionItem value="operations">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Cog className="size-5 text-primary" />
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Operations</span>
                        <span className="text-sm text-muted-foreground font-normal">Total: {formatCurrency(totalOperationCost)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {operationFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_auto_auto] gap-2 items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`operations.${index}.name`}
                        render={({ field }) => (
                           <FormItem>
                             <FormLabel className={index !== 0 ? 'sr-only' : ''}>Operation Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Permits" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`operations.${index}.cost`}
                        render={({ field }) => (
                          <FormItem>
                             <FormLabel className={index !== 0 ? 'sr-only' : ''}>Cost ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="250"
                                {...field}
                                className="w-28"
                              />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOperation(index)}
                         className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendOperation({ name: "", cost: 0 })}
                  >
                    <PlusCircle className="mr-2" /> Add Operation
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="border-t pt-4 space-y-6">
                <div className="grid md:grid-cols-2 gap-6 items-start">
                    <FormField
                        control={form.control}
                        name="taxRate"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <ReceiptText className="size-4" />
                                </div>
                                <FormControl>
                                    <Input type="number" placeholder="15" {...field} className="pl-10"/>
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="profitMargin"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                            Profit Margin (%) -{" "}
                            <span className="font-bold text-primary">
                                {field.value}%
                            </span>
                            </FormLabel>
                            <FormControl>
                            <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[field.value || 0]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="py-2"
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                {(profitMargin ?? 0) < 18 && (
                <Alert variant="destructive" className="bg-amber-100 border-amber-300 text-amber-900">
                    <AlertTriangle className="h-4 w-4 !text-amber-700" />
                    <AlertTitle>Low Profit Margin</AlertTitle>
                    <AlertDescription>
                    Your current profit margin is below the recommended 18% redline.
                    </AlertDescription>
                </Alert>
                )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
