
"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { useStore } from "@/store/cost-store";
import {
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
  AlertTriangle,
  Trash2,
  PlusCircle,
  Briefcase,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MaterialSuggester } from "@/components/design/material-suggester";

const materialItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  cost: z.coerce.number().min(0, "Cost cannot be negative."),
});

const laborItemSchema = z.object({
  vendor: z.string().min(1, "Vendor is required."),
  units: z.coerce.number().min(0, "Units cannot be negative."),
  rate: z.coerce.number().min(0, "Rate cannot be negative."),
  rateType: z.enum(['hourly', 'daily']),
});

const operationItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  cost: z.coerce.number().min(0, "Cost cannot be negative."),
});

export const formSchema = z.object({
  materials: z.array(materialItemSchema).optional(),
  labor: z.array(laborItemSchema).optional(),
  operations: z.array(operationItemSchema).optional(),
  businessType: z.enum(['vat_registered', 'sole_proprietor']),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative.").max(100),
  profitMargin: z.coerce.number().min(0, "Profit margin cannot be negative."),
});

export function CostForm() {
  const { formValues, setFormValues, calculations } = useStore(state => ({
    formValues: state.formValues,
    setFormValues: state.setFormValues,
    calculations: state.calculations,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formValues,
  });

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


  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormValues(value as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form, setFormValues]);


  const profitMargin = form.watch('profitMargin');
  const businessType = form.watch('businessType');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Costing</CardTitle>
        <CardDescription>
          Enter the core costs of your project to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form className="space-y-4">
            <Accordion type="multiple" defaultValue={[]} className="w-full">
              {/* Materials Section */}
              <AccordionItem value="materials">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Package className="size-5 text-primary" />
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">Materials</span>
                        <span className="text-sm text-muted-foreground font-normal">Total: {formatCurrency(calculations.materialCost)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-4">
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
                              <FormLabel className={index !== 0 ? 'sr-only' : ''}>Cost (Ksh)</FormLabel>
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
                  </div>
                  <MaterialSuggester />
                </AccordionContent>
              </AccordionItem>

              {/* Labor Section */}
              <AccordionItem value="labor">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <HardHat className="size-5 text-primary" />
                     <div className="flex flex-col items-start">
                        <span className="font-semibold">Labor / Vendors</span>
                        <span className="text-sm text-muted-foreground font-normal">Total: {formatCurrency(calculations.laborCost)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {laborFields.map((field, index) => {
                    const rateType = form.watch(`labor.${index}.rateType`);
                    return (
                    <div key={field.id} className="p-4 border rounded-md space-y-4 bg-muted/20 relative">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-end">
                            <FormField
                                control={form.control}
                                name={`labor.${index}.vendor`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vendor</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Electrician" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`labor.${index}.units`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{rateType === 'hourly' ? 'Hours' : 'Days'}</FormLabel>
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
                                    <FormLabel>{`Rate (Ksh/${rateType === 'hourly' ? 'hr' : 'day'})`}</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="60" {...field} className="w-24" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name={`labor.${index}.rateType`}
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                <FormLabel>Rate Type</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center gap-4"
                                    >
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <RadioGroupItem value="hourly" id={`hourly-${field.id}`} />
                                        </FormControl>
                                        <FormLabel htmlFor={`hourly-${field.id}`} className="font-normal">Hourly</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <RadioGroupItem value="daily" id={`daily-${field.id}`} />
                                        </FormControl>
                                        <FormLabel htmlFor={`daily-${field.id}`} className="font-normal">Daily</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
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
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )})}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLabor({ vendor: "", units: 0, rate: 0, rateType: 'hourly' })}
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
                        <span className="text-sm text-muted-foreground font-normal">Total: {formatCurrency(calculations.operationalCost)}</span>
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
                             <FormLabel className={index !== 0 ? 'sr-only' : ''}>Cost (Ksh)</FormLabel>
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
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Business Registration Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="vat_registered" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              VAT Registered Company
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="sole_proprietor" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Sole Proprietorship (Turnover Tax)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {businessType === 'vat_registered' && (
                        <FormField
                            control={form.control}
                            name="taxRate"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>VAT Rate (%)</FormLabel>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        <ReceiptText className="size-4" />
                                    </div>
                                    <FormControl>
                                        <Input type="number" placeholder="16" {...field} className="pl-10"/>
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}
                     {businessType === 'sole_proprietor' && (
                        <Alert className="md:col-span-2">
                            <Briefcase className="h-4 w-4" />
                            <AlertTitle>Turnover Tax (TOT)</AlertTitle>
                            <AlertDescription>
                                A 3% tax will be applied to the gross revenue as per KRA guidelines.
                            </AlertDescription>
                        </Alert>
                    )}

                    <FormField
                        control={form.control}
                        name="profitMargin"
                        render={({ field }) => (
                        <FormItem className={businessType === 'sole_proprietor' ? 'md:col-span-2' : ''}>
                            <FormLabel>
                            Profit Margin (%) -{" "}
                            <span className="font-bold text-primary">
                                {field.value?.toFixed(2) ?? 0}%
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
        </FormProvider>
      </CardContent>
    </Card>
  );
}
