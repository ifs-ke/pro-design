
"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/cost-store";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  "Sent": "secondary",
  "Approved": "success",
  "Draft": "outline",
  "Declined": "destructive",
}

export default function QuotesPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { publishedQuotes } = useStore();
  const router = useRouter();

  useEffect(() => {
    useStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Quotes...</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground mt-1">Manage all your client quotes in one place.</p>
        </div>
        <Link href="/costing">
          <Button>
            <PlusCircle className="mr-2" />
            Create New Quote
          </Button>
        </Link>
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishedQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No quotes published yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  publishedQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.id}</TableCell>
                      <TableCell>{quote.clientName}</TableCell>
                      <TableCell>{new Date(quote.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(quote.calculations.grandTotal)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusVariant[quote.status] || "secondary"} className="capitalize">{quote.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">More actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/quotes/${quote.id}`)}>
                              <FileText className="mr-2" /> View Quote
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
