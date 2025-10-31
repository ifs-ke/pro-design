
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/cost-store";
import { Loader2 } from "lucide-react";

interface ProjectFormDialogProps {
    project?: any;
    clients: any[];
    properties: any[];
    children: React.ReactNode;
}

export function ProjectFormDialog({ project, clients, properties, children }: ProjectFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [clientId, setClientId] = useState<string | undefined>("");
    const [propertyId, setPropertyId] = useState<string | undefined>("");
    const [scope, setScope] = useState("");
    const [timeline, setTimeline] = useState("");
    const [projectType, setProjectType] = useState<any>('Residential');
    const [services, setServices] = useState("");
    const [roomCount, setRoomCount] = useState<number | string>("");
    const [otherSpaces, setOtherSpaces] = useState("");
    const [status, setStatus] = useState<any>('Planning');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const saveProject = useStore((state) => state.saveProject);

    const clientProperties = properties.filter(p => p.clientId === clientId);

    useEffect(() => {
        if (open) {
            setName(project?.name || "");
            setClientId(project?.clientId || "");
            setPropertyId(project?.propertyId || "");
            setScope(project?.scope || "");
            setTimeline(project?.timeline || "");
            setProjectType(project?.projectType || 'Residential');
            setServices(project?.services || "");
            setRoomCount(project?.roomCount || "");
            setOtherSpaces(project?.otherSpaces || "");
            setStatus(project?.status || 'Planning');
        }
    }, [open, project]);
    
     useEffect(() => {
        if (propertyId && !clientProperties.some(p => p.id === propertyId)) {
          setPropertyId("");
        }
    }, [clientId, propertyId, clientProperties]);

    const handleSave = () => {
        if (!name || !clientId) {
            toast({ variant: 'destructive', title: "Validation Error", description: "Project Name and Client are required fields." });
            return;
        }

        const projectData: any = { 
            name, 
            clientId, 
            propertyId: propertyId || null,
            scope, 
            timeline,
            projectType,
            services,
            roomCount: roomCount ? Number(roomCount) : null,
            otherSpaces,
            status
        };

        if (project?.id) {
            projectData.id = project.id;
        }

        startTransition(async () => {
            const result = await saveProject(projectData);
            if (result) {
                toast({ title: project ? "Project Updated" : "Project Created", description: `Successfully saved project: ${result.name}` });
                setOpen(false);
            } else {
                toast({ variant: 'destructive', title: "Error", description: "Failed to save project." });
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
                    <DialogDescription>
                        {project ? "Update the details for this project." : "Enter the details for the new project."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name *</Label>
                        <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-client">Client *</Label>
                            <Select onValueChange={setClientId} value={clientId}>
                                <SelectTrigger id="project-client">
                                    <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="project-property">Property</Label>
                            <Select onValueChange={setPropertyId} value={propertyId} disabled={!clientId || clientProperties.length === 0}>
                                <SelectTrigger id="project-property">
                                    <SelectValue placeholder={!clientId ? "Select a client first" : "Select a property"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientProperties.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="project-type">Project Type</Label>
                            <Select onValueChange={(v) => setProjectType(v)} value={projectType}>
                                <SelectTrigger id="project-type">
                                    <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Residential">Residential</SelectItem>
                                    <SelectItem value="Commercial">Commercial</SelectItem>
                                    <SelectItem value="Hospitality">Hospitality</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-status">Status</Label>
                            <Select onValueChange={(v) => setStatus(v)} value={status}>
                                <SelectTrigger id="project-status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Planning">Planning</SelectItem>
                                    <SelectItem value="InProgress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="OnHold">On Hold</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="project-services">Services</Label>
                        <Input id="project-services" value={services} onChange={(e) => setServices(e.target.value)} placeholder="e.g., Full Service, Consultation" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="project-rooms">No of Rooms</Label>
                            <Input id="project-rooms" type="number" value={roomCount} onChange={(e) => setRoomCount(e.target.value)} placeholder="e.g., 3" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="project-spaces">Other spaces</Label>
                            <Input id="project-spaces" value={otherSpaces} onChange={(e) => setOtherSpaces(e.target.value)} placeholder="e.g., Balcony" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="project-scope">Scope of Work</Label>
                        <Textarea id="project-scope" value={scope} onChange={(e) => setScope(e.target.value)} placeholder="e.g., Full interior design for a 3-bedroom apartment..."/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="project-timeline">Timeline</Label>
                        <Input id="project-timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g., 3-4 Weeks" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name || isPending}>
                        {isPending && <Loader2 className="mr-2 animate-spin" />}
                        {project ? "Save Changes" : "Create Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
