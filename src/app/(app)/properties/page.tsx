
"use client";

import { useEffect, useState, useMemo } from "react";
import { useStore, type Property, type PropertyDataInput, type Client } from "@/store/cost-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Home, MoreHorizontal, Edit, Trash2, User, Building, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

function PropertyFormDialog({ property, clients, onSave, children }: { property?: Property, clients: Client[], onSave: (data: PropertyDataInput) => void, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [propertyType, setPropertyType] = useState<Property['propertyType']>('Residential');
    const [clientId, setClientId] = useState<string>("");
    const [notes, setNotes] = useState("");

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
        onSave({ 
            name, 
            address, 
            propertyType,
            clientId, 
            notes,
        });
        setOpen(false);
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
                            <Select onValueChange={(v: Property['propertyType']) => setPropertyType(v)} defaultValue={propertyType}>
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
                    <Button onClick={handleSave} disabled={!name || !clientId}>{property ? "Save Changes" : "Create Property"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const MotionCard = motion(Card);

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};


function PropertyCard({ property }: { property: Property }) {
    const { clients, projects, updateProperty, deleteProperty } = useStore();
    const [showAlert, setShowAlert] = useState(false);

    const client = clients.find(c => c.id === property.clientId);
    const propertyProjects = useMemo(() => {
      return projects.filter(p => p.propertyId === property.id);
    }, [projects, property.id]);

    const handleUpdate = (data: PropertyDataInput) => {
        updateProperty(property.id, data);
    };

    const handleDelete = () => {
        deleteProperty(property.id);
        setShowAlert(false);
    };

    return (
        <MotionCard className="flex flex-col" variants={cardVariants}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-grow pr-4">
                        <CardTitle className="text-xl flex items-start gap-3">
                            <Home className="text-primary mt-1 flex-shrink-0"/>
                            <span>{property.name}</span>
                        </CardTitle>
                        <div className="space-y-1 mt-2">
                            {client && (
                                <CardDescription className="flex items-center gap-2">
                                    <User className="size-4"/> {client.name}
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
                                <PropertyFormDialog property={property} clients={clients} onSave={handleUpdate}>
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
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Linked Projects ({propertyProjects.length})</h4>
                    {propertyProjects.length > 0 ? (
                        <ul className="space-y-2">
                            {propertyProjects.map(p => (
                                <li key={p.id} className="text-sm flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building className="size-4 text-muted-foreground"/>
                                        <span>{p.name}</span>
                                    </div>
                                    <Badge variant="outline" className="capitalize">{p.status}</Badge>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No projects assigned yet.</p>
                    )}
                </div>
            </CardContent>
        </MotionCard>
    );
}

export default function PropertiesPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { properties, clients, addProperty } = useStore();

  useEffect(() => {
    useStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Properties...</div>
        </div>
    );
  }

  const handleCreate = (data: PropertyDataInput) => {
    addProperty(data);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1">Manage all your client properties.</p>
        </div>
        <PropertyFormDialog onSave={handleCreate} clients={clients}>
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
            {properties.sort((a,b) => b.createdAt - a.createdAt).map(property => (
                <PropertyCard key={property.id} property={property} />
            ))}
        </motion.div>
      ): null}
    </div>
  );
}
