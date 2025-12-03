
'use client';

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { HydratedInvoice } from "@/store/cost-store";
import type { ColumnDef } from "@tanstack/react-table";
import Link from 'next/link';
import { DataTableRowActions } from './row-actions';

export const columns: ColumnDef<HydratedInvoice>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Invoice #" />
    ),
    cell: ({ row }) => <div>{row.getValue("invoiceNumber")}</div>,
  },
    {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }) => {
       const client = row.original.client;
       return client ? <Link href={`/crm/${client.id}`} className="hover:underline">{client.name}</Link> : 'N/A';
    }
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "Paid"
          ? "success"
          : status === "Overdue"
          ? "destructive"
          : status === "Sent"
          ? "secondary"
          : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
     filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => formatDate(row.getValue("dueDate")),
  },
  {
    accessorKey: "project.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Project" />
    ),
     cell: ({ row }) => {
       const project = row.original.project;
       return project ? <Link href={`/projects/${project.id}`} className="hover:underline">{project.name}</Link> : 'N/A';
    }
  },
    {
    accessorKey: "quote.id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quote" />
    ),
     cell: ({ row }) => {
       const quote = row.original.quote;
       return quote ? <Link href={`/quotes/${quote.id}`} className="hover:underline">{quote.id}</Link> : 'N/A';
    }
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const { onEdit, onDelete } = table.options.meta as any;
      return <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />;
    }
  }
];
