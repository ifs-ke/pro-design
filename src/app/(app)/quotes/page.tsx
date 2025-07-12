
"use client";

import { useEffect, useState } from "react";
import { useStore, type PublishedQuote, type Project, type Client, type ProjectDataInput } from "@/store/cost-store";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, MoreHorizontal, Trash2, Edit, CheckCircle, Briefcase, Calendar, User, Folder } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  "Sent": "secondary",
  "Approved": "success",
  "Draft": "outline",
  "Declined": "destructive",
}

function AssignProjectDialog({ quote, projects, createProject, assignQuoteToProject, clients }: { quote: PublishedQuote, projects: Project[], createProject: (data: ProjectDataInput) => Project, assignQuoteToProject: (quoteId: string, projectId: string) => void, clients: Client[] }) {
    const [open, setOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string | undefined>(quote.projectId);
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const clientForQuote = clients.find(c => c.id === quote.clientId);

    const handleAssign = () => {
        if (selectedProject) {
            assignQuoteToProject(quote.id, selectedProject);
            setOpen(false);
        }
    }

    const handleCreateAndAssign = () => {
        if (newProjectName) {
            const newProject = createProject({ name: newProjectName, clientId: quote.clientId });
            assignQuoteToProject(quote.id, newProject.id);
            setNewProjectName("");
            setIsCreating(false);
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Briefcase className="mr-2" /> Assign to Project
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Quote to Project</DialogTitle>
                    <DialogDescription>
                        Link this quote ({quote.id}) to an existing project or create a new one.
                    </DialogDescription>
                </DialogHeader>

                {isCreating ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                           <Label htmlFor="new-project-name">New Project Name</Label>
                           <Input id="new-project-name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="e.g., Westlands Office Fit-out" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This new project will be automatically linked to the client: <span className="font-semibold">{clientForQuote?.name || 'Unknown'}</span>.
                        </p>
                        <Button onClick={() => setIsCreating(false)} variant="link" className="p-0">Cancel</Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Project</Label>
                            <Select onValueChange={setSelectedProject} defaultValue={selectedProject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => setIsCreating(true)} variant="link" className="p-0">Or, create a new project</Button>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    {isCreating ? (
                        <Button onClick={handleCreateAndAssign} disabled={!newProjectName}>Create & Assign</Button>
                    ) : (
                        <Button onClick={handleAssign} disabled={!selectedProject}>Assign Project</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const MotionRow = motion(TableRow);

const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

function QuoteRow({ quote }: { quote: PublishedQuote }) {
    const { deleteQuote, updateQuoteStatus, loadQuoteIntoForm, projects, clients, createProject, assignQuoteToProject } = useStore();
    const router = useRouter();

    const handleEdit = (quoteId: string) => {
        loadQuoteIntoForm(quoteId);
        router.push('/costing');
    }

    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || "Unknown Client";
    }

    const getProjectName = (projectId?: string) => {
        if (!projectId) return "N/A";
        return projects.find(p => p.id === projectId)?.name || "Unknown Project";
    }
    
    return (
        <MotionRow key={quote.id} variants={itemVariants} className="[&>td]:p-0 md:[&>td]:p-4">
            <TableCell colSpan={6} className="p-0 md:hidden">
              <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{quote.id}</div>
                    <Badge variant={statusVariant[quote.status] || "secondary"} className="capitalize">{quote.status.toLowerCase()}</Badge>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                      <p className="flex items-center gap-2"><User className="size-4" /> {getClientName(quote.clientId)}</p>
                      <p className="flex items-center gap-2"><Folder className="size-4" /> {getProjectName(quote.projectId)}</p>
                      <p className="flex items-center gap-2"><Calendar className="size-4" /> {new Date(quote.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="font-bold text-lg text-primary">{formatCurrency(quote.calculations.grandTotal)}</div>
                    <div>
                         <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="size-4" />
                                  <span className="sr-only">More actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/quotes/${quote.id}`)}>
                                  <FileText className="mr-2" /> View Quote
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(quote.id)}>
                                  <Edit className="mr-2" /> Edit Quote
                                </DropdownMenuItem>
                                <AssignProjectDialog 
                                    quote={quote} 
                                    projects={projects} 
                                    createProject={createProject}
                                    assignQuoteToProject={assignQuoteToProject}
                                    clients={clients}
                                />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <CheckCircle className="mr-2" />
                                    <span>Change Status</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                      {(['Draft', 'Sent', 'Approved', 'Declined'] as const).map(status => (
                                        <DropdownMenuItem 
                                          key={status} 
                                          onClick={() => updateQuoteStatus(quote.id, status)}
                                          disabled={quote.status === status}
                                        >
                                          {status}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2" /> Delete Quote
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the quote
                                    for <span className="font-semibold">{getClientName(quote.clientId)}</span> (ID: {quote.id}).
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteQuote(quote.id)} className="bg-destructive hover:bg-destructive/90">
                                    Yes, delete it
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </div>
              </div>
            </TableCell>
            <TableCell className="font-medium hidden md:table-cell">{quote.id}</TableCell>
            <TableCell className="hidden md:table-cell">{getClientName(quote.clientId)}</TableCell>
            <TableCell className="hidden md:table-cell">{new Date(quote.timestamp).toLocaleDateString()}</TableCell>
            <TableCell className="hidden md:table-cell">{getProjectName(quote.projectId)}</TableCell>
            <TableCell className="text-right hidden md:table-cell">{formatCurrency(quote.calculations.grandTotal)}</TableCell>
            <TableCell className="text-center hidden md:table-cell">
              <Badge variant={statusVariant[quote.status] || "secondary"} className="capitalize">{quote.status.toLowerCase()}</Badge>
            </TableCell>
            <TableCell className="text-right hidden md:table-cell">
               <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/quotes/${quote.id}`)}>
                        <FileText className="mr-2" /> View Quote
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(quote.id)}>
                        <Edit className="mr-2" /> Edit Quote
                      </DropdownMenuItem>
                      <AssignProjectDialog 
                          quote={quote} 
                          projects={projects} 
                          createProject={createProject}
                          assignQuoteToProject={assignQuoteToProject}
                          clients={clients}
                      />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <CheckCircle className="mr-2" />
                          <span>Change Status</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            {(['Draft', 'Sent', 'Approved', 'Declined'] as const).map(status => (
                              <DropdownMenuItem 
                                key={status} 
                                onClick={() => updateQuoteStatus(quote.id, status)}
                                disabled={quote.status === status}
                              >
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="mr-2" /> Delete Quote
                          </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the quote
                          for <span className="font-semibold">{getClientName(quote.clientId)}</span> (ID: {quote.id}).
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteQuote(quote.id)} className="bg-destructive hover:bg-destructive/90">
                          Yes, delete it
                      </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </TableCell>
        </MotionRow>
    )
}

export default function QuotesPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { publishedQuotes } = useStore();

  useEffect(() => {
    useStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);
  
  if (!isHydrated) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-lg">Loading Quotes...</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground mt-1">Manage all your client quotes in one place.</p>
        </div>
        <Link href="/costing">
          <Button size="sm">
            <PlusCircle className="mr-2" />
            Create New Quote
          </Button>
        </Link>
      </header>

      {publishedQuotes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <CardHeader>
            <FileText className="mx-auto size-12 text-muted-foreground mb-4" />
            <CardTitle>No Quotes Yet</CardTitle>
            <CardDescription>Click "Create New Quote" to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/costing">
              <Button>
                <PlusCircle className="mr-2" />
                Create New Quote
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell">Quote ID</TableHead>
                    <TableHead className="hidden md:table-cell">Client</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Project</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Amount</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody variants={listVariants} initial="hidden" animate="visible">
                  {publishedQuotes.sort((a,b) => b.timestamp - a.timestamp).map((quote) => (
                    <QuoteRow key={quote.id} quote={quote} />
                  ))}
                </motion.tbody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
