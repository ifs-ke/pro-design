
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/cost-store';
import { Loader2 } from 'lucide-react';

const propertyFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  clientId: z.string(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormDialogProps {
  property?: any;
  children: React.ReactNode;
}

export function PropertyFormDialog({ property, children }: PropertyFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { clients, saveProperty } = useStore();
  
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      id: property?.id,
      name: property?.name || '',
      address: property?.address || '',
      clientId: property?.clientId || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        id: property?.id,
        name: property?.name || '',
        address: property?.address || '',
        clientId: property?.clientId || '',
      });
    }
  }, [open, property, form]);

  const onSubmit = async (data: PropertyFormValues) => {
    const savedProperty = await saveProperty(data);
    if (savedProperty) {
        toast({ title: property ? 'Property Updated' : 'Property Created' });
        setOpen(false);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save property.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'Create New Property'}</DialogTitle>
          <DialogDescription>
            {property ? 'Update the details for this property.' : 'Enter the details for the new property.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                {property ? 'Save Changes' : 'Create Property'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
