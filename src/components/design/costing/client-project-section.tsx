
"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useStore } from "@/store/cost-store";
import type { Client, Project, FormValues } from "@/store/cost-store";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus, FolderPlus, Loader2 } from "lucide-react";
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

function AddClientDialog({ onClientAdded }: { onClientAdded: (client: Client) => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isPending, startTransition] = useTransition();
    const saveClient = useStore((state) => state.saveClient);

    const handleAddClient = async () => {
        if (!name) return;
        startTransition(async () => {
            const newClient = await saveClient({ name, email, phone });
            if(newClient){
                onClientAdded(newClient as Client);
                setName("");
                setEmail("");
                setPhone("");
                setOpen(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <UserPlus className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>Create a new client record. You can add more details later in the CRM.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="client-name">Client Name *</Label>
                        <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John Doe" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-email">Email</Label>
                        <Input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="client-phone">Phone</Label>
                        <Input id="client-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +254 712 345 678" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddClient} disabled={!name || isPending}>
                         {isPending && <Loader2 className="mr-2 animate-spin" />}
                        Add Client
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AddProjectDialog({ clientId, onProjectAdded }: { clientId?: string, onProjectAdded: (project: Project) => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [isPending, startTransition] = useTransition();
    const saveProject = useStore((state) => state.saveProject);

    const handleAddProject = async () => {
        if (!name || !clientId) return;
        startTransition(async () => {
            const newProject = await saveProject({ name, clientId });
            if(newProject){
                onProjectAdded(newProject as Project);
                setName("");
                setOpen(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!clientId}>
                    <FolderPlus className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>Create a new project for this client.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name *</Label>
                        <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Westlands Apartment Fit-out" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddProject} disabled={!name || isPending}>
                         {isPending && <Loader2 className="mr-2 animate-spin" />}
                        Add Project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ClientProjectSection() {
    const { clients, projects } = useStore(state => ({
        clients: state.clients,
        projects: state.projects,
      }));
    
      const form = useFormContext<FormValues>();
    
      const selectedClientId = form.watch('clientId');
    
      const clientProjects = useMemo(() => projects.filter(p => p.clientId === selectedClientId), [projects, selectedClientId]);
      
      useEffect(() => {
        const currentProjectId = form.getValues('projectId');
        if (currentProjectId) {
          const projectIsValidForClient = clientProjects.some(p => p.id === currentProjectId);
          if (!projectIsValidForClient) {
            form.setValue('projectId', '');
          }
        }
      }, [selectedClientId, clientProjects, form]);

    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Client</FormLabel>
                        <div className="flex items-center gap-2">
                        <Select
                            onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('projectId', '');
                            }}
                            value={field.value}
                            defaultValue={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <AddClientDialog onClientAdded={(client) => {
                            form.setValue('clientId', client.id, { shouldDirty: true });
                            form.setValue('projectId', '', { shouldDirty: true });
                        }} />
                        </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Project</FormLabel>
                        <div className="flex items-center gap-2">
                        <Select onValueChange={field.onChange} value={field.value || ""} defaultValue={field.value} disabled={!selectedClientId}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {clientProjects.map(project => (
                                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <AddProjectDialog clientId={selectedClientId} onProjectAdded={(project) => {
                            form.setValue('projectId', project.id, { shouldDirty: true });
                        }} />
                        </div>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
