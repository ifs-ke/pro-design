import { getClients } from "@/lib/actions";
import { ClientCard } from "@/components/design/client-card";
import { ClientFormDialog } from "@/components/design/client-form";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default async function CrmPage() {
    const clients = await getClients();

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

            {clients.length === 0 ? (
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
                    {clients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
