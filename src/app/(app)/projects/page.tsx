
"use client";

import { useEffect, useState } from "react";
import { useStore, type Project } from "@/store/cost-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PlusCircle, Building, FileText, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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

function ProjectFormDialog({ project, onSave, children }: { project?: Project, onSave: (name: string) => void, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(project?.name || "");

    useEffect(() => {
        if (open) {
            setName(project?.name || "");
        }
    }, [open, project]);

    const handleSave = () => {
        if (!name) return;
        onSave(name);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
                    <DialogDescription>
                        {project ? "Update the name for this project." : "Enter a name for the new project."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name *</Label>
                        <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name}>{project ? "Save Changes" : "Create Project"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ProjectCard({ project }: { project: Project }) {
    const { publishedQuotes, updateProject, deleteProject } = useStore();
    const [showAlert, setShowAlert] = useState(false);

    const projectQuotes = publishedQuotes.filter(q => q.projectId === project.id);
    const approvedQuotes = projectQuotes.filter(q => q.status === 'Approved');
    const totalApprovedValue = approvedQuotes.reduce((acc, q) => acc + q.calculations.grandTotal, 0);

    const handleUpdate = (name: string) => {
        updateProject(project.id, name);
    };

    const handleDelete = () => {
        deleteProject(project.id);
        setShowAlert(false);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-grow">
                        <CardTitle className="flex items-center gap-2">
                            <Building className="text-primary"/>
                            {project.name}
                        </CardTitle>
                        <CardDescription>
                            Created on {new Date(project.createdAt).toLocaleDateString()}
                        </CardDescription>
                    </div>
                    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <ProjectFormDialog project={project} onSave={handleUpdate}>
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
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Approved Value</h4>
                    <p className="text-2xl font-bold">{formatCurrency(totalApprovedValue)}</p>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Linked Quotes ({projectQuotes.length})</h4>
                    {projectQuotes.length > 0 ? (
                        <ul className="space-y-2">
                            {projectQuotes.map(q => (
                                <li key={q.id} className="text-sm flex items-center justify-between">
                                    <Link href={`/quotes/${q.id}`} className="flex items-center gap-2 hover:underline">
                                        <FileText className="size-4 text-muted-foreground"/>
                                        <span>{q.id}</span>
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
    );
}

export default function ProjectsPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { projects, createProject } = useStore();

  useEffect(() => {
    useStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Projects...</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all your ongoing and completed projects.</p>
        </div>
        <ProjectFormDialog onSave={createProject}>
          <Button>
            <PlusCircle className="mr-2" />
            Create Project
          </Button>
        </ProjectFormDialog>
      </header>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardHeader>
            <Building className="mx-auto size-12 text-muted-foreground mb-4" />
            <CardTitle>No Projects Yet</CardTitle>
            <CardDescription>Assign a quote to a new project or create one to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center">
                <ProjectFormDialog onSave={createProject}>
                    <Button>Create Project</Button>
                </ProjectFormDialog>
                <Button variant="secondary" asChild>
                    <Link href="/quotes">Go to Quotes</Link>
                </Button>
              </div>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.sort((a,b) => b.createdAt - a.createdAt).map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      )}
    </div>
  );
}
