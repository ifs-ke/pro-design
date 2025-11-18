
'use client'

import { useState } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal, Edit, Trash2, Building, FileText, HomeIcon, FilePen } from "lucide-react";
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
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { FollowUpTracker } from "@/components/design/follow-up-tracker";
import { ClientFormDialog } from "./client-form";
import { deleteClient } from "@/lib/actions";
import type { HydratedClient } from "@/store/cost-store";

interface ClientCardProps {
    client: HydratedClient;
}

const responsivenessVariant: { [key: string]: "success" | "secondary" | "destructive" } = {
  "Hot": "success",
  "Warm": "secondary",
  "Cold": "destructive",
};

const statusVariant: { [key: string]: "default" | "secondary" | "outline" } = {
  "Lead": "secondary",
  "Active": "default",
  "Return": "outline",
  "Inactive": "outline"
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ClientCard({ client }: ClientCardProps) {
    const [showAlert, setShowAlert] = useState(false);
    
    return (
        <motion.div variants={cardVariants}>
            <Card className="flex flex-col h-full">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">{client.name}</CardTitle>
                        <CardDescription>
                            {client.email && <span>{client.email}</span>}
                            {client.email && client.phone && " • "}
                            {client.phone && <span>{client.phone}</span>}
                            {!client.email && !client.phone && "No contact info"}
                        </CardDescription>
                    </div>
                    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <ClientFormDialog client={client}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Edit className="mr-2"/> Edit Client
                                    </DropdownMenuItem>
                                </ClientFormDialog>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onSelect={() => setShowAlert(true)}>
                                    <Trash2 className="mr-2" /> Delete Client
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {client.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the client and all associated projects, quotes, and properties.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteClient(client.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow gap-4">
                    <div className="flex gap-2 flex-wrap">
                        <Badge variant={statusVariant[client.status]}>{client.status}</Badge>
                        <Badge variant={responsivenessVariant[client.responsiveness]}>{client.responsiveness}</Badge>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2"><FilePen className="text-primary"/> Notes</h4>
                        <p className="text-sm text-muted-foreground">{client.notes || 'No notes yet.'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                        <div>
                             <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><HomeIcon className="text-primary"/> Properties ({client.properties?.length || 0})</h4>
                            {client.properties?.length > 0 ? (
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {client.properties.map((p) => (
                                      <li key={p.id}>
                                        <Link href={`/properties`} className="hover:underline">{p.name}</Link>
                                      </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">No properties yet.</p>}
                        </div>
                        <div>
                             <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Building className="text-primary"/> Projects ({client.projects?.length || 0})</h4>
                            {client.projects?.length > 0 ? (
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {client.projects.map((p) => (
                                      <li key={p.id}>
                                         <Link href={`/projects`} className="hover:underline">{p.name}</Link>
                                      </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">No projects yet.</p>}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2"><FileText className="text-primary"/> Quotes ({client.quotes?.length || 0})</h4>
                        {client.quotes?.length > 0 ? (
                            <ul className="space-y-1 text-sm text-muted-foreground max-h-24 overflow-y-auto">
                                {client.quotes.map((q) => (
                                    <li key={q.id}>
                                        <Link href={`/quotes/${q.id}`} className="hover:underline flex justify-between">
                                            <span>{q.id.substring(0,8)}...</span>
                                            <span className="font-medium text-foreground">{formatCurrency((q.calculations as any).totalPrice)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground">No quotes yet.</p>}
                    </div>
                    <div className="mt-auto pt-4 border-t">
                        <FollowUpTracker client={client} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
