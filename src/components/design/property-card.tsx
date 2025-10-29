
'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, User, Home, Building, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PropertyFormDialog } from "./property-form";
import { deleteProperty } from "@/lib/actions";
import type { HydratedProperty, Client } from "@/store/cost-store";

interface PropertyCardProps {
    property: HydratedProperty;
    clients: Client[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function PropertyCard({ property, clients }: PropertyCardProps) {
    const [showAlert, setShowAlert] = useState(false);

    return (
        <motion.div variants={cardVariants}>
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-grow pr-4">
                            <CardTitle className="text-xl flex items-start gap-3">
                                <Home className="text-primary mt-1 flex-shrink-0"/>
                                <span>{property.name}</span>
                            </CardTitle>
                            <div className="space-y-1 mt-2">
                                {property.client && (
                                    <CardDescription className="flex items-center gap-2">
                                        <User className="size-4"/>
                                        <Link href="/crm" className="hover:underline">{property.client.name}</Link>
                                    </CardDescription>
                                )}
                                {property.address && (
                                    <CardDescription className="flex items-center gap-2">
                                        <MapPin className="size-4"/> {property.address}
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                        <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <PropertyFormDialog property={property} clients={clients}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Edit className="mr-2"/> Edit Property
                                        </DropdownMenuItem>
                                    </PropertyFormDialog>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onSelect={() => setShowAlert(true)}>
                                        <Trash2 className="mr-2" /> Delete Property
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {property.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the property and unassign it from all linked projects.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteProperty(property.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col">
                    <div className="space-y-4 flex-grow">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{property.propertyType}</Badge>
                        </div>
                        {property.notes && (
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Notes</h4>
                                <p className="text-sm text-foreground whitespace-pre-wrap">{property.notes}</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-auto pt-4 border-t">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Linked Projects ({property.projects?.length || 0})</h4>
                        {property.projects?.length > 0 ? (
                            <ul className="space-y-2">
                                {property.projects.map((p) => (
                                    <li key={p.id} className="text-sm flex items-center justify-between">
                                        <Link href="/projects" className="flex items-center gap-2 hover:underline">
                                            <Building className="size-4 text-muted-foreground"/>
                                            <span>{p.name}</span>
                                        </Link>
                                        <Badge variant="outline" className="capitalize">{p.status}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No projects assigned yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
