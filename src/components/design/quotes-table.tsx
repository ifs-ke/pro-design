
'use client'

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
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
import { MoreHorizontal, Trash2, Edit, CheckCircle, Briefcase, FileText } from "lucide-react";
import { useStore, type HydratedQuote, type Client, type Project } from "@/store/cost-store";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  "Sent": "secondary",
  "Approved": "success",
  "Draft": "outline",
  "Declined": "destructive",
}

function AssignProjectDialog({ quote, projects, clients }: { quote: HydratedQuote, projects: Project[], clients: Client[] }) {
    const [open, setOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string | undefined>(quote.projectId || undefined);
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const clientForQuote = clients.find(c => c.id === quote.clientId);
    const addProject = useStore((state) => state.addProject);
    const assignQuoteToProject = useStore((state) => state.assignQuoteToProject);


    const handleAssign = () => {
        if (selectedProject) {
            startTransition(async () => {
                assignQuoteToProject(quote.id, selectedProject);
                toast({ title: "Quote Assigned" });
                setOpen(false);
            });
        }
    }

    const handleCreateAndAssign = () => {
        if (newProjectName && quote.clientId) {
            startTransition(async () => {
                const newProject = await addProject({ name: newProjectName, clientId: quote.clientId });
                assignQuoteToProject(quote.id, newProject.id);
                toast({ title: "Project Created & Assigned" });
                setNewProjectName("");
                setIsCreating(false);
                setOpen(false);
            });
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
                                    {projects.filter(p => p.clientId === quote.clientId).map(p => (
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
                        <Button onClick={handleCreateAndAssign} disabled={!newProjectName || isPending}>
                            {isPending && <Loader2 className="mr-2 animate-spin" />}
                            Create & Assign
                        </Button>
                    ) : (
                        <Button onClick={handleAssign} disabled={!selectedProject || isPending}>
                             {isPending && <Loader2 className="mr-2 animate-spin" />}
                            Assign Project
                        </Button>
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

function QuoteRow({ quote, projects, clients }: { quote: HydratedQuote, projects: Project[], clients: Client[] }) {
    const { loadQuoteIntoForm, deleteQuote, updateQuoteStatus } = useStore();
    const router = useRouter();
    const { toast } = useToast();
    const [showAlert, setShowAlert] = useState(false);

    const handleEdit = () => {
        loadQuoteIntoForm(quote.id);
        router.push('/costing');
    }
    
    const [isPending, startTransition] = useTransition();

    const handleUpdateStatus = (status: HydratedQuote['status']) => {
        startTransition(async () => {
            await updateQuoteStatus(quote.id, status);
            toast({title: `Quote status set to ${status}`});
        });
    }

    const handleDelete = () => {
        startTransition(async () => {
            await deleteQuote(quote.id);
            toast({title: "Quote deleted successfully"});
        });
    }

    const clientName = quote.client?.name || "Unknown Client";
    const projectName = quote.project?.name || "N/A";
    const grandTotal = (quote.calculations as any)?.grandTotal || 0;
    
    return (
        <MotionRow variants={itemVariants}>
            <TableCell className="font-medium">
                <Link href={`/quotes/${quote.id}`} className="hover:underline">{quote.id}</Link>
                <div className="md:hidden mt-1 text-xs text-muted-foreground">
                    {new Date(quote.timestamp).toLocaleDateString()}
                </div>
            </TableCell>
            <TableCell>
                {clientName}
                <div className="md:hidden mt-1 text-xs text-muted-foreground">
                    {projectName}
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{new Date(quote.timestamp).toLocaleDateString()}</TableCell>
            <TableCell className="hidden lg:table-cell">{projectName}</TableCell>
            <TableCell className="text-right font-semibold">{formatCurrency(grandTotal)}</TableCell>
            <TableCell className="text-center hidden sm:table-cell">
              <Badge variant={statusVariant[quote.status] || "secondary"} className="capitalize">{quote.status.toLowerCase()}</Badge>
            </TableCell>
            <TableCell className="text-right">
               <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
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
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-2" /> Edit Quote
                      </DropdownMenuItem>
                      <AssignProjectDialog 
                          quote={quote} 
                          projects={projects} 
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
                                onClick={() => handleUpdateStatus(status)}
                                disabled={quote.status === status || isPending}
                              >
                                {isPending ? <Loader2 className="mr-2 animate-spin" /> : null}
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onSelect={() => setShowAlert(true)}>
                          <Trash2 className="mr-2" /> Delete Quote
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the quote
                          for <span className="font-semibold">{clientName}</span> (ID: {quote.id}).
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                           {isPending ? <Loader2 className="mr-2 animate-spin" /> : null}
                          Yes, delete it
                      </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </TableCell>
        </MotionRow>
    )
}

interface QuotesTableProps {
    quotes: HydratedQuote[];
    projects: Project[];
    clients: Client[];
}

export function QuotesTable({ quotes, projects, clients }: QuotesTableProps) {
    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <motion.tbody variants={listVariants} initial="hidden" animate="visible">
                <AnimatePresence>
                    {quotes.map((quote) => (
                        <QuoteRow key={quote.id} quote={quote} projects={projects} clients={clients} />
                    ))}
                </AnimatePresence>
            </motion.tbody>
        </Table>
    )
}
