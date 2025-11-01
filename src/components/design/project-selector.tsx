'use client';

import { useStore } from '@/store/cost-store';
import { useFormContext, Controller } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from 'react';

export function ProjectSelector() {
  const { control, watch } = useFormContext();
  const clientId = watch('clientId');
  const { projects } = useStore(state => ({ projects: state.hydratedProjects }));
  const [popoverOpen, setPopoverOpen] = useState(false);

  const clientProjects = projects.filter(p => p.clientId === clientId);

  if (!clientId) {
    return null;
  }

  return (
    <Controller
      name="projectId"
      control={control}
      render={({ field }) => {
        const selectedProject = clientProjects.find(p => p.id === field.value);
        return (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className="w-full justify-between"
                disabled={clientProjects.length === 0}
              >
                {selectedProject
                  ? selectedProject.name
                  : clientProjects.length > 0
                  ? "Assign to Project"
                  : "No projects for this client"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
              <Command>
                <CommandInput placeholder="Search projects..." />
                <CommandEmpty>No projects found.</CommandEmpty>
                <CommandGroup>
                  {clientProjects.map((project) => (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => {
                        field.onChange(project.id);
                        setPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProject?.id === project.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {project.name}
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
