
'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, User, HomeIcon, Building, Calendar, ClipboardList, Home, Settings, BedDouble, Square, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
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
import { ProjectFormDialog } from "./project-form";
import { deleteProject } from "@/lib/actions";

interface ProjectCardProps {
    project: any;
    clients: any[];
    properties: any[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const statusVariant: { [key: string]: "default" | "secondary" | "outline" | "success" | "destructive" } = {
  "Planning": "secondary",
  "InProgress": "default",
  "Completed": "success",
  "OnHold": "outline",
  "Cancelled": "destructive",
};

export function ProjectCard({ project, clients, properties }: ProjectCardProps) {
    const [showAlert, setShowAlert] = useState(false);

    const approvedQuotes = project.quotes?.filter((q: any) => q.status === 'Approved') || [];
    const totalApprovedValue = approvedQuotes.reduce((acc: number, q: any) => acc + (q.calculations as any).grandTotal, 0);

    return (
        <motion.div variants={cardVariants}>
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex-grow pr-4">
                            <CardTitle className="text-xl flex items-start gap-3">
                                <Building className="text-primary mt-1 flex-shrink-0"/>
                                <span>{project.name}</span>
                            </CardTitle>
                            <div className="space-y-1 mt-2">
                                {project.client && (
                                    <CardDescription className="flex items-center gap-2">
                                        <User className="size-4"/> {project.client.name}
                                    </CardDescription>
                                )}
                                {project.property && (
                                    <CardDescription className="flex items-center gap-2">
                                        <HomeIcon className="size-4"/> {project.property.name}
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
                                    <ProjectFormDialog project={project} clients={clients} properties={properties}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Edit className="mr-2"/> Edit Project
                                        </DropdownMenuItem>
                                    </ProjectFormDialog>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onSelect={() => setShowAlert(true)}>
                                        <Trash2 className="mr-2" /> Delete Project
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the project and unassign it from all linked quotes.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteProject(project.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col">
                    <div className="space-y-4 flex-grow">
                        <div className="flex items-center gap-2">
                            <Badge variant={statusVariant[project.status]}>{project.status}</Badge>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Approved Value</h4>
                            <p className="text-2xl font-bold">{formatCurrency(totalApprovedValue)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {project.projectType && (
                                <div className="flex items-start gap-2">
                                    <Home className="size-4 mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Type</p>
                                        <p className="text-muted-foreground">{project.projectType}</p>
                                    </div>
                                </div>
                            )}
                            {project.services && (
                                <div className="flex items-start gap-2">
                                    <Settings className="size-4 mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Services</p>
                                        <p className="text-muted-foreground">{project.services}</p>
                                    </div>
                                </div>
                            )}
                            {project.roomCount && (
                                <div className="flex items-start gap-2">
                                    <BedDouble className="size-4 mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Rooms</p>
                                        <p className="text-muted-foreground">{project.roomCount}</p>
                                    </div>
                                </div>
                            )}
                            {project.otherSpaces && (
                                <div className="flex items-start gap-2">
                                    <Square className="size-4 mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Other Spaces</p>
                                        <p className="text-muted-foreground">{project.otherSpaces}</p>
                                    </div>
                                </div>
                            )}
                            {project.timeline && (
                                <div className="flex items-start gap-2">
                                    <Calendar className="size-4 mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Timeline</p>
                                        <p className="text-muted-foreground">{project.timeline}</p>
                                    </div>
                                </div>
                            )}
                            {project.scope && (
                                <div className="flex items-start gap-2 col-span-2">
                                    <ClipboardList className="size-4 mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Scope</p>
                                        <p className="text-muted-foreground whitespace-pre-wrap">{project.scope}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-auto pt-4 border-t">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Linked Quotes ({project.quotes?.length || 0})</h4>
                        {project.quotes?.length > 0 ? (
                            <ul className="space-y-2">
                                {project.quotes.map((q: any) => (
                                    <li key={q.id} className="text-sm flex items-center justify-between">
                                        <Link href={`/quotes/${q.id}`} className="flex items-center gap-2 hover:underline">
                                            <FileText className="size-4 text-muted-foreground"/>
                                            <span>{q.id.substring(0, 8)}...</span>
                                        </Link>
                                        <Badge variant={q.status === 'Approved' ? 'success' : q.status === 'Declined' ? 'destructive' : 'secondary'} className="capitalize">{q.status.toLowerCase()}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No quotes assigned yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
