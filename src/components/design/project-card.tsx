
'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProjectFormDialog } from './project-form';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/cost-store';
import type { HydratedProject, Client, Property } from '@/store/types';
import { Loader2, Trash2, AlertTriangle, Calendar, MapPin, Users, Building, ChevronDown, ChevronUp } from 'lucide-react';

interface ProjectCardProps {
    project: HydratedProject;
    clients: Client[];
    properties: Property[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const statusVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'success' | 'destructive' } = {
  'Planning': 'secondary',
  'InProgress': 'default',
  'Completed': 'success',
  'OnHold': 'outline',
  'Cancelled': 'destructive',
};

export function ProjectCard({ project, clients, properties }: ProjectCardProps) {
    const [showAlert, setShowAlert] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const deleteProject = useStore((state) => state.deleteProject);

    const approvedQuotes = project.quotes?.filter((q) => q.status === 'Approved') || [];
    const totalApprovedValue = approvedQuotes.reduce((acc: number, q) => acc + (q.calculations as any).grandTotal, 0);

    const handleDelete = () => {
        startTransition(async () => {
            await deleteProject(project.id);
            toast({ title: 'Project Deleted' });
            setShowAlert(false);
        });
    };

    return (
        <motion.div variants={cardVariants}>
            <Card className='flex flex-col h-full'>
                <CardHeader>
                    <div className='flex justify-between items-start'>
                        <div>
                             <CardTitle className='text-lg font-bold'>{project.name}</CardTitle>
                             <CardDescription className='text-sm text-gray-500'>Created on {format(new Date(project.createdAt), 'PPP')}</CardDescription>
                        </div>
                        <Badge variant={statusVariant[project.status] || 'default'}>{project.status}</Badge>
                    </div>
                   
                </CardHeader>
                <CardContent className='flex-grow space-y-4'>
                    <div className='flex items-center text-sm text-gray-600'>
                        <Users className='mr-2 h-4 w-4'/> 
                        <span>{project.client?.name || 'No client'}</span>
                    </div>
                     {project.property && (
                        <div className='flex items-center text-sm text-gray-600'>
                            <Building className='mr-2 h-4 w-4'/> 
                            <span>{project.property.name}</span>
                        </div>
                    )}
                    <Separator />
                    <div className='space-y-2'>
                         <p className='text-xs font-semibold text-gray-500 uppercase'>Scope & Details</p>
                        <p className='text-sm'>{project.scope || 'No scope defined.'}</p>
                    </div>
                    
                     {totalApprovedValue > 0 && (
                        <div>
                            <p className='text-xs font-semibold text-gray-500 uppercase mt-4'>Value</p>
                            <p className='text-lg font-bold text-green-600'>{formatCurrency(totalApprovedValue, 'KES')}</p>
                        </div>
                    )}

                </CardContent>
                <CardFooter className='flex justify-between items-center'>
                    <ProjectFormDialog project={project} clients={clients} properties={properties}>
                        <Button variant='outline' size='sm'>View Details</Button>
                    </ProjectFormDialog>

                    <Dialog open={showAlert} onOpenChange={setShowAlert}>
                        <DialogTrigger asChild>
                            <Button variant='ghost' size='sm' className='text-red-500 hover:text-red-600'>
                                <Trash2 className='h-4 w-4'/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete the project and all associated quotes.
                                </DialogDescription>
                            </DialogHeader>
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                    Deleting this project will also delete {project.quotes?.length || 0} quote(s) associated with it.
                                </AlertDescription>
                            </Alert>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowAlert(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 animate-spin" />}
                                    Delete Project
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </CardFooter>
            </Card>
        </motion.div>
    )
}
