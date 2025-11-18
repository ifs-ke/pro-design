
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, PaymentPlan } from "@/store/cost-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { useEffect } from "react";

const invoiceFormSchema = z.object({
  clientId: z.string().nonempty({ message: "Please select a client." }),
  projectId: z.string().optional(),
  quoteId: z.string().optional(),
  invoiceNumber: z.string().nonempty({ message: "Invoice number is required." }),
  status: z.enum(["Draft", "Sent", "Paid", "Overdue"]),
  startDate: z.date(),
  endDate: z.date(),
  amount: z.coerce.number().min(0),
  paymentPlan: z.enum(["Gold", "Silver", "Bronze"]),
  paymentTerms: z.string().optional(),
});

const paymentTermsDefaults: Record<PaymentPlan, string> = {
    Gold: "Payment due within 30 days. 5% discount for payment within 10 days.",
    Silver: "Payment due within 60 days. 2% discount for payment within 20 days.",
    Bronze: "Payment due within 90 days.",
};

export function InvoiceForm({ invoice, onSubmit, onCancel }) {
  const { clients, projects, quotes } = useStore();

  const form = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: invoice ? {
        ...invoice,
        startDate: new Date(invoice.startDate),
        endDate: new Date(invoice.endDate),
    } : {
      clientId: "",
      projectId: "",
      quoteId: "",
      invoiceNumber: `INV-${Date.now()}`,
      status: "Draft",
      startDate: new Date(),
      endDate: new Date(),
      amount: 0,
      paymentPlan: "Silver",
      paymentTerms: paymentTermsDefaults.Silver,
    },
  });

  const selectedClientId = form.watch("clientId");
  const selectedProjectId = form.watch("projectId");
  const selectedQuoteId = form.watch("quoteId");
  const selectedStartDate = form.watch("startDate");
  const selectedPaymentPlan = form.watch("paymentPlan");

  const availableProjects = selectedClientId ? projects.filter(p => p.clientId === selectedClientId) : [];
  const availableQuotes = selectedProjectId ? quotes.filter(q => q.projectId === selectedProjectId) : [];

  useEffect(() => {
    if (selectedQuoteId) {
        const selectedQuote = quotes.find(q => q.id === selectedQuoteId);
        if (selectedQuote) {
            form.setValue("amount", selectedQuote.calculations.totalPrice);
        }
    }
  }, [selectedQuoteId, quotes, form]);

  useEffect(() => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (project && project.timeline && selectedStartDate) {
      const timelineDays = parseInt(project.timeline, 10);
      if (!isNaN(timelineDays)) {
        const newEndDate = addDays(selectedStartDate, timelineDays);
        form.setValue("endDate", newEndDate);
      }
    }
  }, [selectedProjectId, selectedStartDate, projects, form]);

    useEffect(() => {
        if (selectedPaymentPlan) {
            form.setValue("paymentTerms", paymentTermsDefaults[selectedPaymentPlan]);
        }
    }, [selectedPaymentPlan, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                        {client.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedClientId}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {availableProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                            {project.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="quoteId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quote</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedProjectId}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a quote" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {availableQuotes.map((quote) => (
                            <SelectItem key={quote.id} value={quote.id}>
                            {'Quote #' + quote.id.substring(0, 5) + ' - ' + format(new Date(quote.timestamp), "PP") + ' - ' + quote.status}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="paymentPlan"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Payment Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a payment plan" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Silver">Silver</SelectItem>
                            <SelectItem value="Bronze">Bronze</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                     <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="paymentTerms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Terms</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe the payment terms..." className="min-h-[100px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{invoice ? "Update" : "Create"} Invoice</Button>
        </div>
      </form>
    </Form>
  );
}
