
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useEffect } from "react";
import { useStore, Invoice } from "@/store/cost-store";
import { useToast } from "@/hooks/use-toast";

const invoiceFormSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional().nullable(),
  quoteId: z.string().optional().nullable(),
  invoiceNumber: z.string().nonempty({ message: "Invoice number is required." }),
  status: z.enum(["Draft", "Sent", "Paid", "Overdue", "Cancelled"]),
  dueDate: z.date(),
  amount: z.coerce.number().min(0),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  invoice: Invoice | null;
  clients: any[];
  projects: any[];
  quotes: any[];
  onSuccess: () => void;
}

export function InvoiceForm({ invoice, clients, projects, quotes, onSuccess }: InvoiceFormProps) {
  const { saveInvoice } = useStore();
  const { toast } = useToast();
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: '',
      projectId: null,
      quoteId: null,
      invoiceNumber: '',
      status: 'Draft',
      dueDate: new Date(),
      amount: 0,
    },
  });

  useEffect(() => {
    form.reset({
      id: invoice?.id,
      clientId: invoice?.clientId || '',
      projectId: invoice?.projectId || null,
      quoteId: invoice?.quoteId || null,
      invoiceNumber: invoice?.invoiceNumber || `INV-${Date.now()}`,
      status: invoice?.status || 'Draft',
      dueDate: invoice ? new Date(invoice.dueDate) : new Date(),
      amount: invoice?.amount || 0,
    });
  }, [invoice, form]);

  const selectedClientId = form.watch("clientId");
  const selectedProjectId = form.watch("projectId");
  const selectedQuoteId = form.watch("quoteId");

  const approvedQuotes = quotes.filter((q: any) => q.status === 'Approved');
  const clientsWithApprovedQuotes = clients.filter((c: any) => approvedQuotes.some((q: any) => q.clientId === c.id));

  const availableProjects = selectedClientId 
    ? projects.filter((p: any) => p.clientId === selectedClientId && approvedQuotes.some(q => q.projectId === p.id))
    : [];

  const availableQuotes = selectedProjectId
    ? approvedQuotes.filter((q: any) => q.projectId === selectedProjectId)
    : [];

  useEffect(() => {
    if (selectedQuoteId) {
        const selectedQuote = quotes.find((q: any) => q.id === selectedQuoteId);
        if (selectedQuote) {
            form.setValue("amount", selectedQuote.calculations.totalPrice);
        }
    }
  }, [selectedQuoteId, quotes, form]);
  
  const onSubmit = async (data: InvoiceFormValues) => {
    const result = await saveInvoice(data as Invoice);
    if (result) {
        toast({ title: invoice ? "Invoice Updated" : "Invoice Created" });
        onSuccess();
    } else {
        toast({ variant: 'destructive', title: "Error", description: "Failed to save invoice." });
    }
  };

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
                <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {clientsWithApprovedQuotes.map((client: any) => (
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
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedClientId}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {availableProjects.map((project: any) => (
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
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedProjectId}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a quote" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {availableQuotes.map((quote: any) => (
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
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
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin"/>}
            {invoice ? "Update" : "Create"} Invoice
          </Button>
        </div>
      </form>
    </Form>
  );
}
