
'use client';

import { useStore } from "@/store/cost-store";
import { useIsHydrated } from "@/hooks/use-hydrated-store";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Home, User } from "lucide-react";
import { PropertyFormDialog } from "@/components/design/property-form";
import { PropertyCard } from "@/components/design/property-card";
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

export default function PropertiesPage() {
  const { properties, clients } = useStore((state) => state.getHydratedData());
  const isLoading = !useIsHydrated();

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Properties...</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage all your client properties.</p>
        </div>
        <PropertyFormDialog clients={clients}>
          <Button size="sm" disabled={clients.length === 0}>
            <PlusCircle className="mr-2" />
            Create Property
          </Button>
        </PropertyFormDialog>
      </header>
        {clients.length === 0 && (
             <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                 <CardHeader>
                    <User className="mx-auto size-12 text-muted-foreground mb-4" />
                    <CardTitle>No Clients Found</CardTitle>
                    <CardDescription>You must create a client before you can add a property.</CardDescription>
                </CardHeader>
             </Card>
        )}
      {clients.length > 0 && properties.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardHeader>
            <Home className="mx-auto size-12 text-muted-foreground mb-4" />
            <CardTitle>No Properties Yet</CardTitle>
            <CardDescription>Click "Create Property" to get started.</CardDescription>
            </CardHeader>
        </Card>
      ) : clients.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            {properties.map(property => (
                <PropertyCard key={property.id} property={property} clients={clients} />
            ))}
        </motion.div>
      ): null}
    </div>
  );
}
