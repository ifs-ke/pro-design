
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

export function InvoicesToolbar({ table, onCreate }) {
  return (
    <div className="flex items-center justify-between p-4 bg-card-alt border-b">
        <div className="flex-1">
            <Input
                placeholder="Filter by client or invoice number..."
                value={(table.getColumn("client_name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("client_name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
            />
        </div>
        <Button onClick={onCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
        </Button>
    </div>
  );
}
