
"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/store/cost-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Users } from "lucide-react";

interface ClientData {
    name: string;
    quoteCount: number;
    totalValue: number;
    approvedValue: number;
    lastActivity: number;
}

export default function CrmPage() {
    const [isHydrated, setIsHydrated] = useState(false);
    const { publishedQuotes } = useStore();

    useEffect(() => {
        useStore.persist.rehydrate();
        setIsHydrated(true);
    }, []);

    const clientData = useMemo(() => {
        const clients: { [key: string]: ClientData } = {};

        publishedQuotes.forEach(quote => {
            if (!quote.clientName) return;

            if (!clients[quote.clientName]) {
                clients[quote.clientName] = {
                    name: quote.clientName,
                    quoteCount: 0,
                    totalValue: 0,
                    approvedValue: 0,
                    lastActivity: 0,
                };
            }

            const client = clients[quote.clientName];
            client.quoteCount += 1;
            client.totalValue += quote.calculations.grandTotal;
            if (quote.status === 'Approved') {
                client.approvedValue += quote.calculations.grandTotal;
            }
            if (quote.timestamp > client.lastActivity) {
                client.lastActivity = quote.timestamp;
            }
        });

        return Object.values(clients).sort((a, b) => b.lastActivity - a.lastActivity);

    }, [publishedQuotes]);

    if (!isHydrated) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Loading CRM...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-bold tracking-tight">Client Relationship Management</h1>
                <p className="text-muted-foreground mt-1">An overview of all your clients and their engagement.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>All Clients</CardTitle>
                    <CardDescription>
                        Found {clientData.length} unique clients from your quotes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {clientData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center border-dashed rounded-lg">
                            <Users className="mx-auto size-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold">No Clients Found</h3>
                            <p className="text-muted-foreground">Create a quote with a client name to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Client Name</TableHead>
                                        <TableHead className="text-center">Quotes</TableHead>
                                        <TableHead className="text-right">Total Quoted</TableHead>
                                        <TableHead className="text-right">Approved Value</TableHead>
                                        <TableHead>Last Activity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientData.map(client => (
                                        <TableRow key={client.name}>
                                            <TableCell className="font-medium">{client.name}</TableCell>
                                            <TableCell className="text-center">{client.quoteCount}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(client.totalValue)}</TableCell>
                                            <TableCell className="text-right font-semibold text-primary">{formatCurrency(client.approvedValue)}</TableCell>
                                            <TableCell>{new Date(client.lastActivity).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
