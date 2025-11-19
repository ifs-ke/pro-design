
'use client'

import { useState } from 'react';
import { useStore, type HydratedClient, type Interaction } from '@/store/cost-store';
import { Button } from '@/components/ui/button';
import { InteractionForm } from '@/components/design/interaction-form';
import { timeSince } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, MessageSquarePlus, Bot, Mail, Phone, Handshake, MessageSquare } from 'lucide-react';

const interactionIcons = {
    Email: Mail,
    Call: Phone,
    Meeting: Handshake,
    Other: MessageSquare,
};

interface FollowUpTrackerProps {
    client: HydratedClient;
}

export function FollowUpTracker({ client }: FollowUpTrackerProps) {
    const [showInteractionForm, setShowInteractionForm] = useState(false);
    const [selectedInteraction, setSelectedInteraction] = useState<Interaction | undefined>();
    const { hydratedInteractions, deleteInteraction } = useStore();

    const clientInteractions = hydratedInteractions.filter(i => i.clientId === client.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const openInteractionForm = (interaction?: Interaction) => {
        setSelectedInteraction(interaction);
        setShowInteractionForm(true);
    };

    const handleDeleteInteraction = async (id: string) => {
        await deleteInteraction(id);
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm flex items-center gap-2"><Bot className="text-primary"/> Follow-up History</h4>
                <Button size="xs" variant="outline" onClick={() => openInteractionForm()}><MessageSquarePlus className="mr-2 h-4 w-4"/> Add Log</Button>
            </div>
            {clientInteractions.length > 0 ? (
                <div className="space-y-3 text-sm text-muted-foreground max-h-48 overflow-y-auto pr-2">
                    {clientInteractions.map((i) => {
                        const Icon = interactionIcons[i.type as keyof typeof interactionIcons] || MessageSquare;
                        return (
                            <div key={i.id} className="flex items-start justify-between gap-2">
                                <div className='flex items-start gap-2'>
                                    <Icon className="size-4 text-primary mt-1" />
                                    <div>
                                        <span className="font-semibold text-foreground">{i.type}</span> - <span className="text-xs">{timeSince(new Date(i.timestamp))}</span>
                                        <p className="text-sm">{i.notes}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openInteractionForm(i)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteInteraction(i.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No interactions logged yet.</p>
            )}
            <InteractionForm 
                clientId={client.id}
                interaction={selectedInteraction} 
                open={showInteractionForm} 
                onOpenChange={setShowInteractionForm} 
            />
        </div>
    );
}
