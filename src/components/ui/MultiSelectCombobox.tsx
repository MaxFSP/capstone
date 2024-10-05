'use client';

import { useState } from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '~/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import { ScrollArea } from '~/components/ui/scroll-area';

interface MultiSelectComboboxProps {
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  selectedValues: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectCombobox({
  options,
  placeholder,
  selectedValues,
  onChange,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);

  const toggleSelection = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span>
            {selectedValues.length > 0
              ? `${selectedValues.length} selected`
              : placeholder ?? 'Select options'}
          </span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder ?? 'Search...'} />
          <CommandEmpty>No results found.</CommandEmpty>
          <ScrollArea className="h-72">
            <CommandList>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option.value} onSelect={() => toggleSelection(option.value)}>
                    <div className="mr-2 h-4 w-4">
                      {selectedValues.includes(option.value) ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : null}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
