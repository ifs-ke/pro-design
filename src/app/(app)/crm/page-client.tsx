
'use client';

import { useState } from 'react';
import { useStore } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";
import { ClientCard } from "@/components/design/client-card";
import { ClientFormDialog } from "@/components/design/client-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Users, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function CrmPageClient({ clients: initialClients }: { clients: any[] }) {
    const { hydratedClients } = useStore();
    const isLoading = !useIsHydrated();
    const [searchTerm, setSearchTerm] = useState('');

    const clients = hydratedClients || initialClients;

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Loading Clients...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Relationship Management</h1>
                    <p className="text-muted-foreground mt-1">A central hub for all your client information and history.</p>
                </div>
                 <ClientFormDialog>
                    <Button size="sm"><PlusCircle className="mr-2"/> Create New Client</Button>
                </ClientFormDialog>
            </header>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredClients.length === 0 ? (
                 <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <CardHeader>
                        <Users className="mx-auto size-12 text-muted-foreground mb-4" />
                        <CardTitle>No Clients Found</CardTitle>
                        <CardDescription>
                            {searchTerm ? "No clients match your search." : "Click \"Create New Client\" to get started."}
                        </CardDescription>
                    </CardHeader>
                    {!searchTerm && (
                        <CardContent>
                            <ClientFormDialog>
                                <Button>Create New Client</Button>
                            </ClientFormDialog>
                        </CardContent>
                    )}
             </Card>
            ) : (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                    {filteredClients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
