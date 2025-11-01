
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
import { MoreHorizontal, Trash2, Edit, CheckCircle, Briefcase, FileText, Loader2 } from "lucide-react";
import { useStore, type HydratedQuote, type Client, type Project, type QuoteStatus } from "@/store/cost-store";
import { useToast } from "@/hooks/use-toast";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  "Sent": "secondary",
  "Approved": "success",
  "Draft": "outline",
  "Declined": "destructive",
  "Received": "default",
}

function AssignProjectDialog({ quote, projects, clients }: { quote: HydratedQuote, projects: Project[], clients: Client[] }) {
    const [open, setOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string | undefined>(quote.projectId || undefined);
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isAssigning, startAssignTransition] = useTransition();
    const { toast } = useToast();
    const clientForQuote = clients.find(c => c.id === quote.clientId);
    const addProject = useStore((state) => state.addProject);
    const assignQuoteToProject = useStore((state) => state.assignQuoteToProject);


    const handleAssign = () => {
        if (selectedProject) {
            startAssignTransition(async () => {
                assignQuoteToProject(quote.id, selectedProject);
                toast({ title: "Quote Assigned" });
                setOpen(false);
            });
        }
    }

    const handleCreateAndAssign = () => {
        if (newProjectName && quote.clientId) {
            startAssignTransition(async () => {
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
                    <Briefcase className="mr-2 h-4 w-4" /> Assign to Project
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
                        <Button onClick={() => setIsCreating(false)} variant="link" className="p-0 h-auto">Cancel</Button>
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
                        <Button onClick={() => setIsCreating(true)} variant="link" className="p-0 h-auto">Or, create a new project</Button>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    {isCreating ? (
                        <Button onClick={handleCreateAndAssign} disabled={!newProjectName || isAssigning}>
                            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create & Assign
                        </Button>
                    ) : (
                        <Button onClick={handleAssign} disabled={!selectedProject || isAssigning}>
                             {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    
    const [isUpdateStatusPending, startUpdateStatusTransition] = useTransition();
    const [isDeletePending, startDeleteTransition] = useTransition();
    const [updatingStatus, setUpdatingStatus] = useState<QuoteStatus | null>(null);


    const handleEdit = () => {
        loadQuoteIntoForm(quote.id);
        router.push('/costing');
    }

    const handleUpdateStatus = (status: QuoteStatus) => {
        setUpdatingStatus(status);
        startUpdateStatusTransition(async () => {
            try {
                await updateQuoteStatus(quote.id, status);
                toast({title: `Quote status set to ${status}`});
            } catch (error) {
                toast({ title: "Error updating status", variant: "destructive" });
            }
            setUpdatingStatus(null);
        });
    }

    const handleDelete = () => {
        startDeleteTransition(async () => {
            try {
                await deleteQuote(quote.id);
                toast({title: "Quote deleted successfully"});
                setShowDeleteAlert(false);
            } catch (error) {
                toast({ title: "Error deleting quote", variant: "destructive" });
            }
        });
    }

    const clientName = quote.client?.name || "Unknown Client";
    const projectName = quote.project?.name || "N/A";
    const totalPrice = (quote.calculations as any)?.totalPrice || 0;
    
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
            <TableCell className="text-right font-semibold">{formatCurrency(totalPrice)}</TableCell>
            <TableCell className="text-center hidden sm:table-cell">
              <Badge variant={statusVariant[quote.status] || "secondary"} className="capitalize">{quote.status.toLowerCase()}</Badge>
            </TableCell>
            <TableCell className="text-right">
               <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/quotes/${quote.id}`)}>
                        <FileText className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Quote
                      </DropdownMenuItem>
                      <AssignProjectDialog 
                          quote={quote} 
                          projects={projects} 
                          clients={clients}
                      />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Change Status</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            {(["Draft", "Sent", "Approved", "Declined", "Received"] as const).map(status => (
                              <DropdownMenuItem 
                                key={status} 
                                onSelect={() => handleUpdateStatus(status)}
                                disabled={quote.status === status || isUpdateStatusPending}
                              >
                                {isUpdateStatusPending && updatingStatus === status ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <div className="w-6" /> // Placeholder for alignment
                                )}
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => setShowDeleteAlert(true)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Quote
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
                      <AlertDialogAction onClick={handleDelete} disabled={isDeletePending} className="bg-destructive hover:bg-destructive/90">
                           {isDeletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
            </TableHeader>
            <motion.tbody variants={listVariants} initial="hidden" animate="visible" layout>
                <AnimatePresence>
                    {quotes.map((quote) => (
                        <QuoteRow key={quote.id} quote={quote} projects={projects} clients={clients} />
                    ))}
                </AnimatePresence>
            </motion.tbody>
        </Table>
    )
}
