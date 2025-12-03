
'use client';

import { useTransition } from 'react';
import type { Row } from '@tanstack/react-table';
import { CheckCircle, Edit, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useStore, type InvoiceStatus } from '@/store/cost-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { HydratedInvoice } from '@/store/cost-store';

interface DataTableRowActionsProps {
  row: Row<HydratedInvoice>;
  onEdit: (invoice: HydratedInvoice) => void;
  onDelete: (invoiceId: string) => void;
}

export function DataTableRowActions({ row, onEdit, onDelete }: DataTableRowActionsProps) {
  const { updateInvoiceStatus } = useStore();
  const { toast } = useToast();
  const [isUpdateStatusPending, startUpdateStatusTransition] = useTransition();

  const invoice = row.original;

  const handleUpdateStatus = (status: InvoiceStatus) => {
    startUpdateStatusTransition(async () => {
      try {
        await updateInvoiceStatus(invoice.id, status);
        toast({ title: `Invoice status set to ${status}` });
      } catch (error) {
        toast({ title: 'Error updating status', variant: 'destructive' });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEdit(invoice)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <CheckCircle className="mr-2 h-4 w-4" />
            Change Status
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {(["Draft", "Sent", "Paid", "Overdue", "Cancelled"] as const).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  disabled={invoice.status === status || isUpdateStatusPending}
                >
                  {isUpdateStatusPending && invoice.status === status ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <div className="w-6" />
                  )}
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => onDelete(invoice.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
