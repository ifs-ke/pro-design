'use client'

import { useState, useEffect, useTransition } from "react";
import type { Property, Client } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createProperty, updateProperty } from "@/lib/actions";
import { Loader2 } from "lucide-react";

interface PropertyFormDialogProps {
    property?: Property;
    clients: Client[];
    children: React.ReactNode;
}

export function PropertyFormDialog({ property, clients, children }: PropertyFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [propertyType, setPropertyType] = useState<any>('Residential');
    const [clientId, setClientId] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            setName(property?.name || "");
            setAddress(property?.address || "");
            setPropertyType(property?.propertyType || 'Residential');
            setClientId(property?.clientId || "");
            setNotes(property?.notes || "");
        }
    }, [open, property]);

    const handleSave = () => {
        if (!name || !clientId) return;
        
        startTransition(async () => {
            try {
                if (property) {
                    await updateProperty(property.id, { name, address, propertyType, clientId, notes });
                    toast({ title: "Property Updated" });
                } else {
                    await createProperty({ name, address, propertyType, clientId, notes });
                    toast({ title: "Property Created" });
                }
                setOpen(false);
            } catch (error) {
                toast({ variant: 'destructive', title: "Error", description: "Failed to save property." });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{property ? "Edit Property" : "Create New Property"}</DialogTitle>
                    <DialogDescription>
                        {property ? "Update the details for this property." : "Enter the details for the new property."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="property-name">Property Name *</Label>
                        <Input id="property-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Kileleshwa Duplex" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="property-client">Client *</Label>
                        <Select onValueChange={setClientId} defaultValue={clientId}>
                            <SelectTrigger id="property-client">
                                <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="property-address">Address</Label>
                           <Input id="property-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="property-type">Property Type</Label>
                            <Select onValueChange={(v) => setPropertyType(v)} defaultValue={propertyType}>
                                <SelectTrigger id="property-type">
                                    <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Residential">Residential</SelectItem>
                                    <SelectItem value="Commercial">Commercial</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="property-notes">Notes</Label>
                        <Textarea id="property-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Gate code is 1234..."/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name || !clientId || isPending}>
                        {isPending && <Loader2 className="mr-2 animate-spin" />}
                        {property ? "Save Changes" : "Create Property"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
