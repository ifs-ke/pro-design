'use client';

import { useStore } from '@/store/cost-store';
import { useFormContext, Controller } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from 'react';

export function ClientSelector() {
  const { control } = useFormContext();
  const { clients } = useStore(state => ({ clients: state.hydratedClients }));
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <Controller
      name="clientId"
      control={control}
      render={({ field }) => {
        const selectedClient = clients.find(c => c.id === field.value);
        return (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className="w-full justify-between"
              >
                {selectedClient ? selectedClient.name : "Select Client"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
              <Command>
                <CommandInput placeholder="Search clients..." />
                <CommandEmpty>No clients found.</CommandEmpty>
                <CommandGroup>
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.name}
                      onSelect={() => {
                        field.onChange(client.id);
                        setPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {client.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }}
    />
  );
}
