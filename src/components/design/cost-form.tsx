"use client";

import { useForm, type UseFormReturn } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Package,
  HardHat,
  Cog,
  ReceiptText,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const formSchema = z.object({
  materialCost: z.coerce.number().min(0, "Cost cannot be negative."),
  laborHours: z.coerce.number().min(0, "Hours cannot be negative."),
  laborRate: z.coerce.number().min(0, "Rate cannot be negative."),
  operationalCost: z.coerce.number().min(0, "Cost cannot be negative."),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative.").max(100),
  profitMargin: z.coerce.number().min(0, "Profit margin cannot be negative."),
});

interface CostFormProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
    {children}
  </div>
);

export function CostForm({ form }: CostFormProps) {
  const profitMargin = form.watch("profitMargin");

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
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="materialCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Cost ($)</FormLabel>
                    <div className="relative">
                      <IconWrapper>
                        <Package className="size-4" />
                      </IconWrapper>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} className="pl-10"/>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="operationalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operational Cost ($)</FormLabel>
                     <div className="relative">
                      <IconWrapper>
                        <Cog className="size-4" />
                      </IconWrapper>
                      <FormControl>
                        <Input type="number" placeholder="1500" {...field} className="pl-10"/>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="laborHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor (Hours)</FormLabel>
                    <div className="relative">
                      <IconWrapper>
                        <HardHat className="size-4" />
                      </IconWrapper>
                      <FormControl>
                        <Input type="number" placeholder="80" {...field} className="pl-10"/>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="laborRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Rate ($/hr)</FormLabel>
                    <div className="relative">
                       <IconWrapper>
                        <span className="text-base">$</span>
                      </IconWrapper>
                      <FormControl>
                        <Input type="number" placeholder="60" {...field} className="pl-10"/>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 items-start">
               <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <div className="relative">
                       <IconWrapper>
                        <ReceiptText className="size-4" />
                      </IconWrapper>
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
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             {profitMargin < 18 && (
              <Alert variant="destructive" className="bg-amber-100 border-amber-300 text-amber-900">
                <AlertTriangle className="h-4 w-4 !text-amber-700" />
                <AlertTitle>Low Profit Margin</AlertTitle>
                <AlertDescription>
                  Your current profit margin is below the recommended 18% redline.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
