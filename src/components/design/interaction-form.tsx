
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore, type Interaction } from '@/store/cost-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const interactionSchema = z.object({
  type: z.enum(['Call', 'Email', 'Meeting', 'Note']),
  notes: z.string().min(1, 'Notes are required'),
});

interface InteractionFormProps {
  clientId: string;
  interaction?: Interaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InteractionForm({ clientId, interaction, open, onOpenChange }: InteractionFormProps) {
  const [isPending, startTransition] = useTransition();
  const { addInteraction, updateInteraction } = useStore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof interactionSchema>>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: interaction?.type || 'Call',
      notes: interaction?.notes || '',
    },
  });

  const onSubmit = (values: z.infer<typeof interactionSchema>) => {
    startTransition(async () => {
      try {
        if (interaction) {
          await updateInteraction(interaction.id, values);
          toast({ title: 'Interaction updated' });
        } else {
          await addInteraction(clientId, values);
          toast({ title: 'Interaction added' });
        }
        onOpenChange(false);
      } catch (error) {
        toast({ title: 'An error occurred', variant: 'destructive' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{interaction ? 'Edit' : 'Add'} Interaction</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['Call', 'Email', 'Meeting', 'Note'].map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Log your interaction..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
