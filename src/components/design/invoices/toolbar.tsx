
'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { InvoiceForm } from "./invoice-form";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { statuses } from "./data";

export function InvoicesToolbar({ table }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by client..."
          value={(table.getColumn("client.name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("client.name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
      </div>
      <div className="flex items-center space-x-2">
        <InvoiceForm>
          <Button className="h-8">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Invoice
          </Button>
        </InvoiceForm>
      </div>
    </div>
  );
}
