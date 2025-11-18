'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InvoicesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage your invoices.</p>
        </div>
        <Link href="/invoices/new">
          <Button>Create Invoice</Button>
        </Link>
      </div>
      {/* Invoice list will go here */}
    </div>
  );
}
