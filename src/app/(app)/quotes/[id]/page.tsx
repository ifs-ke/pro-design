
'use client';

import { useStore, type QuoteStatus } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CostBreakdown } from "@/components/design/quote-display";
import { MaterialsList } from "@/components/design/materials-list";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useTransition, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Calculations, Allocation, FormValues, HydratedQuote } from "@/store/cost-store";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  "Sent": "secondary",
  "Approved": "success",
  "Draft": "outline",
  "Declined": "destructive",
  "Received": "default"
};

const emptyCalculations: Calculations = {
    totalMaterialCost: 0, totalLaborCost: 0, totalOperationCost: 0, totalAffiliateCost: 0,
    subtotal: 0, miscAmount: 0, subtotalWithMisc: 0, taxAmount: 0, totalCost: 0,
    profitAmount: 0, totalPrice: 0, salaryAmount: 0, nssfAmount: 0, shifAmount: 0,
    totalLaborHours: 0, effectiveLaborHours: 0,
};
const emptyAllocations: Allocation = { savings: 0, futureDev: 0, csr: 0 };
const emptyFormValues: FormValues = { 
    materials: [], labor: [], operations: [], affiliates: [], salaries: [],
    businessType: "vat_registered", taxRate: 16, profitMargin: 25, 
    miscPercentage: 0, salaryPercentage: 0, laborConcurrencyPercentage: 0,
    enableNSSF: false, enableSHIF: false, 
    clientId: '', projectId: '' 
};

function QuoteDetailPageContent({ quote }: { quote: HydratedQuote }) {
  const { updateQuoteStatus } = useStore();
  const { toast } = useToast();
  const [isUpdateStatusPending, startUpdateStatusTransition] = useTransition();
  const [updatingStatus, setUpdatingStatus] = useState<QuoteStatus | null>(null);

  const handleUpdateStatus = (status: QuoteStatus) => {
    setUpdatingStatus(status);
    startUpdateStatusTransition(async () => {
        try {
            await updateQuoteStatus(quote.id, status);
            toast({title: `Quote status set to ${status}`});
        } catch (error) {
            toast({ title: "Error updating status", variant: "destructive" });
        }
        setUpdatingStatus(null);
    });
  }
  
  const calculations = quote.calculations || emptyCalculations;
  const suggestedCalculations = quote.suggestedCalculations || emptyCalculations;
  const allocations = quote.allocations || emptyAllocations;
  const formValues = quote.formValues || emptyFormValues;
  const materials = formValues.materials || [];
  const clientName = quote.client ? quote.client.name : "Unknown Client";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/quotes">
            <ArrowLeft className="mr-2" />
            Back to Quotes
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <p className="text-sm sm:text-base text-muted-foreground">Quote ID: {quote.id}</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{clientName}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Published on {new Date(quote.timestamp).toLocaleDateString()}
            </p>
             <div className="flex items-center gap-2 mt-2">
               <Badge variant={statusVariant[quote.status] || "secondary"} className="capitalize text-sm sm:text-base">{quote.status.toLowerCase()}</Badge>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">Change Status</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                      {(["Draft", "Sent", "Approved", "Declined", "Received"] as const).map(status => (
                        <DropdownMenuItem 
                          key={status} 
                          onSelect={() => handleUpdateStatus(status)}
                          disabled={quote.status === status || isUpdateStatusPending}
                        >
                          {isUpdateStatusPending && updatingStatus === status ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                              <div className="w-4 mr-2" /> // Placeholder to maintain alignment
                          )}
                          {status}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
          <div className="text-left sm:text-right mt-4 sm:mt-0">
            <p className="text-sm sm:text-base text-muted-foreground">Grand Total</p>
            <p className="text-3xl sm:text-4xl font-bold text-primary">{formatCurrency(calculations.totalPrice)}</p>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-1 gap-8 items-start">
        <CostBreakdown
          calculations={calculations}
          allocations={allocations}
          suggestedCalculations={suggestedCalculations}
          formValues={formValues}
        />
        {materials.length > 0 && (
          <>
            <Separator />
            <MaterialsList materials={materials} />
          </>
        )}
      </div>
    </div>
  );
}


export default function QuoteDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const isHydrated = useIsHydrated();
  const { quotes, clients, projects } = useStore();

  const quote = useMemo(() => {
    if (!isHydrated) return null;
    const rawQuote = quotes.find(q => q.id === id);
    if (!rawQuote) return null;

    return {
        ...rawQuote,
        client: clients.find(c => c.id === rawQuote.clientId),
        project: projects.find(p => p.id === rawQuote.projectId),
    }
  }, [id, isHydrated, quotes, clients, projects]);

  if (!isHydrated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quote) {
    notFound();
    return null;
  }

  return <QuoteDetailPageContent quote={quote} />;
}
