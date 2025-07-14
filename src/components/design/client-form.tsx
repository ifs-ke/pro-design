
'use client'

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { updateClient } from "@/lib/actions";
import { useStore } from "@/store/cost-store";
import { Loader2 } from "lucide-react";

interface ClientFormDialogProps {
    client?: any;
    children: React.ReactNode;
}

export function ClientFormDialog({ client, children }: ClientFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState<any>(client?.status || 'Lead');
    const [responsiveness, setResponsiveness] = useState<any>(client?.responsiveness || 'Warm');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const addClient = useStore((state) => state.addClient);

    useEffect(() => {
        if (client) {
            setName(client.name);
            setEmail(client.email || "");
            setPhone(client.phone || "");
            setStatus(client.status);
            setResponsiveness(client.responsiveness);
        } else {
            setName("");
            setEmail("");
            setPhone("");
            setStatus('Lead');
            setResponsiveness('Warm');
        }
    }, [client]);

    const handleSave = () => {
        if (!name) return;
        
        startTransition(async () => {
            try {
                if (client) {
                    await updateClient(client.id, { name, email, phone, status, responsiveness });
                    toast({ title: "Client Updated", description: `${name} has been successfully updated.` });
                } else {
                    addClient({ name, email, phone });
                    toast({ title: "Client Created", description: `${name} has been successfully created.` });
                }
                setOpen(false);
            } catch (error) {
                toast({ variant: 'destructive', title: "Error", description: "Failed to save client." });
            }
        });
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
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="client-status">Status</Label>
                           <Select onValueChange={(value) => setStatus(value)} defaultValue={status}>
                                <SelectTrigger id="client-status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Lead">Lead</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="OnHold">On-Hold</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="client-responsiveness">Responsiveness</Label>
                           <Select onValueChange={(value) => setResponsiveness(value)} defaultValue={responsiveness}>
                                <SelectTrigger id="client-responsiveness">
                                    <SelectValue placeholder="Select responsiveness" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hot">Hot</SelectItem>
                                    <SelectItem value="Warm">Warm</SelectItem>
                                    <SelectItem value="Cold">Cold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name || isPending}>
                        {isPending && <Loader2 className="mr-2 animate-spin" />}
                        {client ? "Save Changes" : "Create Client"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
