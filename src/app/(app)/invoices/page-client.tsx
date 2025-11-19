
'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { InvoicesDataTable } from '@/components/design/invoices/data-table';
import { formatCurrency } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';
import { AlertTriangle, BadgeCheck, Clock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { InvoiceForm } from '@/components/design/invoices/invoice-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/store/cost-store';
import { useIsHydrated } from '@/hooks/use-hydrated-store';

export function InvoicesPageClient({ invoices: initialInvoices, clients: initialClients, projects: initialProjects, quotes: initialQuotes }: any) {
  const {
    hydratedInvoices,
    clients,
    projects,
    quotes,
    setData,
    deleteInvoice,
    updateInvoiceStatus,
  } = useStore();
  const isHydrated = useIsHydrated();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    if (isHydrated) {
        setData({ clients: initialClients, projects: initialProjects, quotes: initialQuotes, invoices: initialInvoices });
    }
  }, [isHydrated, initialClients, initialProjects, initialQuotes, initialInvoices, setData]);

  const summary = useMemo(() => {
    const invoices = hydratedInvoices || [];
    const totalOutstanding = invoices.filter((i: any) => i.status === 'Sent' || i.status === 'Draft').reduce((sum: any, i: any) => sum + i.amount, 0);
    const totalOverdue = invoices.filter((i: any) => i.status === 'Overdue').reduce((sum: any, i: any) => sum + i.amount, 0);
    const totalPaid = invoices.filter((i: any) => i.status === 'Paid').reduce((sum: any, i: any) => sum + i.amount, 0);
    return { totalOutstanding, totalOverdue, totalPaid };
  }, [hydratedInvoices]);

  const openCreateForm = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (invoiceId: string) => {
    await deleteInvoice(invoiceId);
  };

  if (!isHydrated) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 flex flex-col gap-8 p-4 md:p-6">
        <header className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Invoices
            </h1>
            <p className="text-muted-foreground mt-1">
                Effortlessly manage your financial documents.
            </p>
            </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                {formatCurrency(summary.totalOutstanding)}
                </div>
                <p className="text-xs text-muted-foreground">
                Total amount pending payment
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                {formatCurrency(summary.totalOverdue)}
                </div>
                <p className="text-xs text-muted-foreground">
                Total amount past due date
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                {formatCurrency(summary.totalPaid)}
                </div>
                <p className="text-xs text-muted-foreground">
                Total amount successfully collected
                </p>
            </CardContent>
            </Card>
        </div>

        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetContent className="sm:max-w-2xl">
            <SheetHeader>
                <SheetTitle>
                {editingInvoice ? 'Edit' : 'Create'} Invoice
                </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] p-4">
                <InvoiceForm
                    invoice={editingInvoice}
                    clients={clients}
                    projects={projects}
                    quotes={quotes}
                    onSuccess={() => setIsFormOpen(false)}
                />
            </ScrollArea>
            </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col">
            <Card className="flex-1 flex flex-col">
            <CardContent className="flex-1 flex flex-col p-6">
                <InvoicesDataTable
                    data={hydratedInvoices}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={openCreateForm}
                    onStatusChange={updateInvoiceStatus}
                    isPending={false}
                />
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
