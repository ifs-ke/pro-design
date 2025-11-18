
'use client';

import * as React from 'react';
import { useStore } from '@/store/cost-store';
import type { HydratedInvoice } from '@/store/types';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';
import { useIsHydrated } from '@/hooks/use-hydrated-store';

export function InvoicesDataTable() {
  const { hydratedInvoices } = useStore();
  const isHydrated = useIsHydrated();

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={hydratedInvoices}
      // Pass state and setters to the DataTable
      state={{
        rowSelection,
        columnVisibility,
        columnFilters,
        sorting,
      }}
      onRowSelectionChange={setRowSelection}
      onColumnVisibilityChange={setColumnVisibility}
      onColumnFiltersChange={setColumnFilters}
      onSortingChange={setSorting}
    />
  );
}
