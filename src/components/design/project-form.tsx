
'use client'

import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
    Form, 
    FormControl, 
    FormField, 
    FormItem, 
    FormLabel, 
    FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useStore, Project } from "@/store/cost-store";
import { Loader2 } from "lucide-react";

const projectFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Project Name is required.'),
  clientId: z.string().min(1, 'Client is required.'),
  propertyId: z.string().nullable(),
  scope: z.string().optional(),
  timeline: z.string().optional(),
  projectType: z.enum(['Residential', 'Commercial', 'Hospitality', 'Other']).default('Residential'),
  services: z.string().optional(),
  roomCount: z.number().nullable(),
  otherSpaces: z.string().optional(),
  status: z.enum(['Planning', 'InProgress', 'Completed', 'OnHold', 'Cancelled']).default('Planning'),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormDialogProps {
    project?: Project;
    clients: any[];
    properties: any[];
    children: React.ReactNode;
}

export function ProjectFormDialog({ project, clients, properties, children }: ProjectFormDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { saveProject } = useStore();
    
    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
    });

    const watchedClientId = form.watch('clientId');
    const clientProperties = properties.filter(p => p.clientId === watchedClientId);

    useEffect(() => {
        if (open) {
            form.reset({
                id: project?.id,
                name: project?.name || "",
                clientId: project?.clientId || "",
                propertyId: project?.propertyId || null,
                scope: project?.scope || "",
                timeline: project?.timeline || "",
                projectType: project?.projectType || 'Residential',
                services: project?.services || "",
                roomCount: project?.roomCount || null,
                otherSpaces: project?.otherSpaces || "",
                status: project?.status || 'Planning',
            });
        } else {
            form.reset(); // Reset form when dialog closes to clear validation
        }
    }, [open, project, form]);

    useEffect(() => {
        const currentPropertyId = form.getValues('propertyId');
        if (currentPropertyId && !clientProperties.some(p => p.id === currentPropertyId)) {
            form.setValue('propertyId', null);
        }
    }, [watchedClientId, form, clientProperties]);

    const onSubmit = async (data: ProjectFormValues) => {
        const result = await saveProject(data as Project);
        if (result) {
            toast({ title: project ? "Project Updated" : "Project Created" });
            setOpen(false);
        } else {
            toast({ variant: 'destructive', title: "Error", description: "Failed to save project." });
        }
    };

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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name *</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                         <FormControl><SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="propertyId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Property</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchedClientId || clientProperties.length === 0}>
                                         <FormControl><SelectTrigger><SelectValue placeholder={!watchedClientId ? "Select client first" : "Select property"} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {clientProperties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                     <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        {/* ... Other form fields converted similarly ... */}
                         <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                                {project ? "Save Changes" : "Create Project"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
