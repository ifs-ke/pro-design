
"use client";

import { useState } from "react";
import { useStore, type Client, type Interaction } from "@/store/cost-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, MessageSquare, Phone, Handshake, Mail } from "lucide-react";

const interactionIcons = {
    'Email': Mail,
    'Call': Phone,
    'Meeting': Handshake,
    'Other': MessageSquare,
};

function AddInteractionDialog({ clientId, children }: { clientId: string, children: React.ReactNode }) {
    const { addInteraction } = useStore();
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<Interaction['type']>('Call');
    const [notes, setNotes] = useState("");

    const handleSave = () => {
        if (!type || !notes) return;
        addInteraction(clientId, { type, notes });
        setNotes("");
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log New Interaction</DialogTitle>
                    <DialogDescription>Record a new follow-up or communication with this client.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="interaction-type">Interaction Type</Label>
                        <Select onValueChange={(value: Interaction['type']) => setType(value)} defaultValue={type}>
                            <SelectTrigger id="interaction-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Call">Call</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                                <SelectItem value="Meeting">Meeting</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="interaction-notes">Notes</Label>
                        <Textarea id="interaction-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Discussed quote revisions..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!type || !notes}>Save Interaction</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export function FollowUpTracker({ client }: { client: Client }) {
    const interactions = client.interactions || [];
    const sortedInteractions = [...interactions].sort((a,b) => b.timestamp - a.timestamp);

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">Follow-up History ({interactions.length})</h4>
                <AddInteractionDialog clientId={client.id}>
                    <Button variant="ghost" size="sm">
                        <PlusCircle className="mr-2 size-4" />
                        Log
                    </Button>
                </AddInteractionDialog>
            </div>
            {sortedInteractions.length > 0 ? (
                <div className="space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                    {sortedInteractions.map(interaction => {
                        const Icon = interactionIcons[interaction.type];
                        return (
                            <div key={interaction.id} className="text-xs">
                                <div className="flex items-center gap-2 font-medium">
                                    <Icon className="size-3.5 text-primary" />
                                    <span>{interaction.type}</span>
                                    <span className="text-muted-foreground font-normal">- {new Date(interaction.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-muted-foreground pl-6">{interaction.notes}</p>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No interactions logged yet.</p>
            )}
        </div>
    )
}

    