
"use client";

import { useFormContext } from "react-hook-form";
import type { Calculations, FormValues } from "@/store/cost-store";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ReceiptText,
  AlertTriangle,
  Briefcase,
  Milestone,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SummarySectionProps {
    calculations: Calculations;
}

export function SummarySection({ calculations }: SummarySectionProps) {
    const form = useFormContext<FormValues>();
    const businessType = form.watch('businessType');

    return (
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
                        <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                            <RadioGroupItem value="no_tax" />
                        </FormControl>
                        <FormLabel className="font-normal">
                            No Tax / Not Applicable
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
                    <FormItem className="md:col-span-2">
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
                            <p className="font-bold text-lg text-primary">{formatCurrency(calculations.totalPrice)}</p>
                        </div>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            {(calculations.profitAmount ?? 0) < 18 && calculations.totalPrice > 0 && (
            <Alert variant="destructive" className="bg-amber-100 border-amber-300 text-amber-900">
                <AlertTriangle className="h-4 w-4 !text-amber-700" />
                <AlertTitle>Low Profit Margin</AlertTitle>
                <AlertDescription>
                Your current profit margin is below the recommended 18% redline.
                </AlertDescription>
            </Alert>
            )}
        </div>
    )
}
