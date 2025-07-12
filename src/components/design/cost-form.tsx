
"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
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
  Handshake,
  Milestone,
  SlidersHorizontal,
  Users,
  MessageSquarePlus
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MaterialSuggester } from "@/components/design/material-suggester";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const materialItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
  cost: z.coerce.number().min(0, "Cost cannot be negative.").optional(),
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

const affiliateItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  rateType: z.enum(['hourly', 'daily', 'percentage']),
  units: z.coerce.number().min(0, "Units cannot be negative.").optional(),
  rate: z.coerce.number().min(0, "Rate cannot be negative."),
}).refine(data => {
    if (data.rateType === 'hourly' || data.rateType === 'daily') {
        return data.units !== undefined && data.units !== null;
    }
    return true;
}, {
    message: "Units are required for hourly or daily rates.",
    path: ['units'],
});


export const formSchema = z.object({
  clientName: z.string().optional(),
  materials: z.array(materialItemSchema).optional(),
  labor: z.array(laborItemSchema).optional(),
  operations: z.array(operationItemSchema).optional(),
  affiliates: z.array(affiliateItemSchema).optional(),
  businessType: z.enum(['vat_registered', 'sole_proprietor']),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative.").max(100),
  profitMargin: z.coerce.number().min(0, "Profit margin cannot be negative."),
  miscPercentage: z.coerce.number().min(0, "Misc. percentage cannot be negative."),
  salaryPercentage: z.coerce.number().min(0, "Salary percentage cannot be negative."),
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

  const [showDescription, setShowDescription] = useState<{ [index: number]: boolean }>({});

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
  const {
    fields: affiliateFields,
    append: appendAffiliate,
    remove: removeAffiliate,
  } = useFieldArray({ control: form.control, name: "affiliates" });


  useEffect(() => {
    const subscription = form.watch((value) => {
      // Use a deep copy to ensure state updates correctly for nested array changes
      setFormValues(JSON.parse(JSON.stringify(value)) as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form, setFormValues]);


  const miscPercentage = form.watch('miscPercentage');
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
             <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        className="p-4 border rounded-md space-y-4 bg-muted/20 relative"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px] gap-4">
                            <FormField
                                control={form.control}
                                name={`materials.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Material Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Fabric" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`materials.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Qty</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="1" {...field} />
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
                                    <FormLabel>Unit Cost (Ksh)</FormLabel>
                                    <FormControl>
                                        <Input
                                        type="number"
                                        placeholder="500"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {showDescription[index] ? (
                            <FormField
                                control={form.control}
                                name={`materials.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Add a short description..." {...field} className="h-16"/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <Button 
                                type="button" 
                                variant="link" 
                                size="sm"
                                className="p-0 h-auto text-muted-foreground"
                                onClick={() => setShowDescription(prev => ({...prev, [index]: true}))}
                            >
                                <MessageSquarePlus className="mr-2"/>
                                Add Description
                            </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMaterial(index)}
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendMaterial({ name: "", quantity: 1, cost: 0, description: "" })}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
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
                                name={`labor.${index}.rateType`}
                                render={({ field }) => (
                                    <FormItem>
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                             <FormField
                                control={form.control}
                                name={`labor.${index}.units`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{rateType === 'hourly' ? 'Hours' : 'Days'}</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="8" {...field} />
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
                                        <Input type="number" placeholder="60" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
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
                  <Label>Fixed Operational Costs</Label>
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
                    <PlusCircle className="mr-2" /> Add Operation Cost
                  </Button>
                  
                  <Separator />

                  <FormField
                        control={form.control}
                        name="salaryPercentage"
                        render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center">
                                <FormLabel className="flex items-center gap-2">
                                  <Users className="size-4" />
                                  Salaries
                                </FormLabel>
                                <span className="font-bold text-primary">
                                    {field.value?.toFixed(2) ?? 0}%
                                </span>
                            </div>
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
                            <div className="text-right text-sm text-muted-foreground">
                              Calculated Amount: <span className="font-medium text-foreground">{formatCurrency(calculations.salaryCost)}</span>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                  <Separator />
                   <FormField
                        control={form.control}
                        name="miscPercentage"
                        render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center">
                                <FormLabel className="flex items-center gap-2">
                                  <SlidersHorizontal className="size-4" />
                                  Miscellaneous Costs
                                </FormLabel>
                                <span className="font-bold text-primary">
                                    {field.value?.toFixed(2) ?? 0}%
                                </span>
                            </div>
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
                            <div className="text-right text-sm text-muted-foreground">
                              Calculated Amount: <span className="font-medium text-foreground">{formatCurrency(calculations.miscCost)}</span>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </AccordionContent>
              </AccordionItem>
              
              {/* Affiliates Section */}
              <AccordionItem value="affiliates">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Handshake className="size-5 text-primary" />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Affiliates / Partners</span>
                      <span className="text-sm text-muted-foreground font-normal">Total: {formatCurrency(calculations.affiliateCost)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  {affiliateFields.map((field, index) => {
                    const rateType = form.watch(`affiliates.${index}.rateType`);
                    return (
                      <div key={field.id} className="p-4 border rounded-md space-y-4 bg-muted/20 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`affiliates.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Partner Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`affiliates.${index}.rateType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rate Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a rate type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="hourly">Hourly</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(rateType === 'hourly' || rateType === 'daily') && (
                            <FormField
                              control={form.control}
                              name={`affiliates.${index}.units`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{rateType === 'hourly' ? 'Hours' : 'Days'}</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="8" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          <FormField
                            control={form.control}
                            name={`affiliates.${index}.rate`}
                            render={({ field }) => (
                              <FormItem className={rateType === 'percentage' ? 'md:col-span-2' : ''}>
                                <FormLabel>{
                                  rateType === 'hourly' ? 'Hourly Rate (Ksh/hr)' :
                                  rateType === 'daily' ? 'Daily Rate (Ksh/day)' :
                                  'Percentage Rate (%)'
                                }</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder={rateType === 'percentage' ? '10' : '500'} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAffiliate(index)}
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAffiliate({ name: "", rateType: 'percentage', rate: 10, units: 0 })}
                  >
                    <PlusCircle className="mr-2" /> Add Partner
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="border-t pt-6 space-y-6">
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
                            <div className="flex justify-between items-center">
                                <FormLabel>Profit Margin (%)</FormLabel>
                                <span className="font-bold text-primary">
                                    {field.value?.toFixed(2) ?? 0}%
                                </span>
                            </div>
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
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                                <Label className="text-xs text-primary/80 flex items-center justify-center gap-1">
                                    <Milestone className="size-3"/>
                                    Suggested Quote
                                </Label>
                                <p className="font-bold text-lg text-primary">{formatCurrency(calculations.grandTotal)}</p>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                
                {(calculations.profitMargin ?? 0) < 18 && calculations.grandTotal > 0 && (
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

    