
"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore, type Client, type PublishedQuote, type Project } from "@/store/cost-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Users, PlusCircle, FileText, Building, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link';

function ClientFormDialog({ client, onSave, children }: { client?: Client, onSave: (data: any) => void, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(client?.name || "");
    const [email, setEmail] = useState(client?.email || "");
    const [phone, setPhone] = useState(client?.phone || "");

    useEffect(() => {
        if (client) {
            setName(client.name);
            setEmail(client.email || "");
            setPhone(client.phone || "");
        } else {
            setName("");
            setEmail("");
            setPhone("");
        }
    }, [client]);

    const handleSave = () => {
        if (!name) return;
        onSave({ name, email, phone });
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{client ? "Edit Client" : "Create New Client"}</DialogTitle>
                    <DialogDescription>
                        {client ? "Update the details for this client." : "Enter the details for the new client."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="client-name">Client Name *</Label>
                        <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-email">Email</Label>
                        <Input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-phone">Phone</Label>
                        <Input id="client-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name}>{client ? "Save Changes" : "Create Client"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ClientCard({ client }: { client: Client }) {
    const { publishedQuotes, projects, deleteClient } = useStore();
    const [showAlert, setShowAlert] = useState(false);

    const clientQuotes = useMemo(() => {
        return publishedQuotes.filter(q => q.clientId === client.id).sort((a,b) => b.timestamp - a.timestamp);
    }, [publishedQuotes, client.id]);

    const clientProjects = useMemo(() => {
        const projectIds = new Set(clientQuotes.map(q => q.projectId).filter(Boolean));
        return projects.filter(p => projectIds.has(p.id));
    }, [clientQuotes, projects]);
    
    const handleDelete = () => {
      deleteClient(client.id);
      setShowAlert(false);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>{client.name}</CardTitle>
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
                             <ClientFormDialog
                                client={client}
                                onSave={(data) => useStore.getState().updateClient(client.id, data)}
                             >
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
                                This action cannot be undone. This will permanently delete the client and may orphan their associated quotes and projects.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2"><Building className="text-primary"/> Projects ({clientProjects.length})</h4>
                         {clientProjects.length > 0 ? (
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                {clientProjects.map(p => <li key={p.id}>{p.name}</li>)}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground mt-2">No projects yet.</p>}
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2"><FileText className="text-primary"/> Quotes ({clientQuotes.length})</h4>
                         {clientQuotes.length > 0 ? (
                             <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                {clientQuotes.map(q => (
                                    <li key={q.id}>
                                        <Link href={`/quotes/${q.id}`} className="hover:underline flex justify-between">
                                            <span>{q.id}</span>
                                            <span className="font-medium text-foreground">{formatCurrency(q.calculations.grandTotal)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                         ) : <p className="text-sm text-muted-foreground mt-2">No quotes yet.</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function CrmPage() {
    const [isHydrated, setIsHydrated] = useState(false);
    const { clients, addClient } = useStore();

    useEffect(() => {
        useStore.persist.rehydrate();
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Loading CRM...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Client Relationship Management</h1>
                    <p className="text-muted-foreground mt-1">A central hub for all your client information and history.</p>
                </div>
                 <ClientFormDialog onSave={addClient}>
                    <Button><PlusCircle className="mr-2"/> Create New Client</Button>
                </ClientFormDialog>
            </header>

            {clients.length === 0 ? (
                <div className="text-center p-12 border-dashed rounded-lg">
                    <Users className="mx-auto size-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No Clients Found</h3>
                    <p className="text-muted-foreground">Click "Create New Client" to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {clients.sort((a,b) => b.createdAt - a.createdAt).map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            )}
        </div>
    );
}
