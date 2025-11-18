
'use client';

import { useStore } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InvoicesDataTable } from "@/components/design/invoices/data-table";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceForm } from "@/components/design/invoices/invoice-form";
import { InvoicesToolbar } from "@/components/design/invoices/toolbar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function InvoicesPage() {
    const { invoices, addInvoice, updateInvoice, deleteInvoice } = useStore();
    const isLoading = !useIsHydrated();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);

    const summary = useMemo(() => {
        if (isLoading || !invoices) return { totalOutstanding: 0, totalOverdue: 0, totalPaid: 0 };

        const totalOutstanding = invoices
            .filter(i => i.status === 'Sent' || i.status === 'Draft')
            .reduce((sum, i) => sum + i.amount, 0);

        const totalOverdue = invoices
            .filter(i => i.status === 'Overdue')
            .reduce((sum, i) => sum + i.amount, 0);
        
        const totalPaid = invoices
            .filter(i => i.status === 'Paid')
            .reduce((sum, i) => sum + i.amount, 0);

        return { totalOutstanding, totalOverdue, totalPaid };
    }, [invoices, isLoading]);

    const handleFormSubmit = async (data) => {
        const invoiceData = {
            ...data,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
        };

        if (editingInvoice) {
            await updateInvoice({ ...editingInvoice, ...invoiceData });
        } else {
            await addInvoice(invoiceData);
        }
        setIsFormOpen(false);
        setEditingInvoice(null);
    };

    const openCreateForm = () => {
        setEditingInvoice(null);
        setIsFormOpen(true);
    };

    const handleEdit = (invoice) => {
        setEditingInvoice(invoice);
        setIsFormOpen(true);
    };

    const handleDelete = async (invoiceId) => {
        await deleteInvoice(invoiceId);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Loading Invoices...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
                    <p className="text-muted-foreground mt-1">Effortlessly manage your financial documents.</p>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalOutstanding)}</div>
                        <p className="text-xs text-muted-foreground">Total amount pending payment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalOverdue)}</div>
                        <p className="text-xs text-muted-foreground">Total amount past due date</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</div>
                        <p className="text-xs text-muted-foreground">Total amount successfully collected</p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-4xl">
                     <DialogHeader>
                        <DialogTitle>{editingInvoice ? "Edit" : "Create"} Invoice</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh] p-4">
                        <InvoiceForm 
                            invoice={editingInvoice} 
                            onSubmit={handleFormSubmit} 
                            onCancel={() => {
                                setIsFormOpen(false);
                                setEditingInvoice(null);
                            }}
                        />
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            
            <Card>
                <CardContent className="p-0">
                    <InvoicesDataTable 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCreate={openCreateForm}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
