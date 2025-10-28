
'use client';

import { useStore, HydratedClient } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";
import { ClientCard } from "@/components/design/client-card";
import { ClientFormDialog } from "@/components/design/client-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function CrmPage() {
    const { clients, projects, quotes, properties } = useStore();
    const isLoading = !useIsHydrated();

    const hydratedClients: HydratedClient[] = useMemo(() => {
        const hydratedQuotes = quotes.map(q => ({
            ...q,
            client: clients.find(c => c.id === q.clientId),
            project: projects.find(p => p.id === q.projectId),
        }));

        const hydratedProjects = projects.map(p => ({
            ...p,
            client: clients.find(c => c.id === p.clientId),
            property: properties.find(prop => prop.id === p.propertyId),
            quotes: hydratedQuotes.filter(q => q.projectId === p.id),
        }));
        
        return clients.map(c => ({
            ...c,
            projects: hydratedProjects.filter(p => p.clientId === c.id),
            quotes: hydratedQuotes.filter(q => q.clientId === c.id),
            properties: properties.filter(p => p.clientId === c.id),
        })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    }, [clients, projects, quotes, properties]);

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

            {hydratedClients.length === 0 ? (
                <div className="text-center p-12 border-dashed rounded-lg">
                    <Users className="mx-auto size-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No Clients Found</h3>
                    <p className="text-muted-foreground">Click "Create New Client" to get started.</p>
                </div>
            ) : (
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                    {hydratedClients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
