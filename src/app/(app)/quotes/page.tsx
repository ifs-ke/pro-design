
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PlusCircle, FileText, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const quotes = [
  { id: "QT-001", client: "ABC Corp", date: "2024-07-20", total: 250000, status: "Sent" },
  { id: "QT-002", client: "Tech Innovators", date: "2024-07-18", total: 780000, status: "Approved" },
  { id: "QT-003", client: "Home Renovations Ltd", date: "2024-07-15", total: 120000, status: "Draft" },
  { id: "QT-004", client: "The Coffee House", date: "2024-07-12", total: 450000, status: "Declined" },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  "Sent": "secondary",
  "Approved": "success",
  "Draft": "outline",
  "Declined": "destructive",
}


export default function QuotesPage() {
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
                  <TableHead className="text-right">Amount (KES)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>{quote.client}</TableCell>
                    <TableCell>{quote.date}</TableCell>
                    <TableCell className="text-right">{quote.total.toLocaleString()}</TableCell>
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
                          <DropdownMenuItem>
                            <FileText className="mr-2" /> View Quote
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
